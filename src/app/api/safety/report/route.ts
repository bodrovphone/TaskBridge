import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safetyReports, users, applications, tasks } from '@/database/schema'
import { eq, and, or, count } from 'drizzle-orm'

/**
 * POST /api/safety/report
 * Submit a safety report against a user
 *
 * SECURITY: Only users with actual task interaction history can report
 * - Customers can report professionals they hired (accepted application)
 * - Professionals can report customers they worked with
 *
 * Automatic Suspension Logic:
 * - If a user receives 2+ reports from different reporters WITH task history,
 *   they are automatically suspended
 * - This prevents abuse from random users/bots
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reporterId, reportedUserId, reportType, description, evidenceUrls, relatedTaskId } = body

    // Validation
    if (!reporterId || !reportedUserId || !reportType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prevent self-reporting
    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      )
    }

    // CRITICAL: Verify the reporter has actual task history with reported user
    const hasTaskHistory = await verifyTaskInteraction(reporterId, reportedUserId)

    if (!hasTaskHistory) {
      return NextResponse.json(
        { error: 'You can only report users you have worked with through completed tasks' },
        { status: 403 }
      )
    }

    // Check if reporter already reported this user
    const existingReport = await db.query.safetyReports.findFirst({
      where: and(
        eq(safetyReports.reporterId, reporterId),
        eq(safetyReports.reportedUserId, reportedUserId)
      )
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this user' },
        { status: 400 }
      )
    }

    // Create the safety report
    const [newReport] = await db.insert(safetyReports).values({
      reporterId,
      reportedUserId,
      reportType,
      description,
      evidenceUrls: evidenceUrls || [],
      relatedTaskId,
      status: 'pending'
    }).returning()

    // Count total UNIQUE reports against this user (from different reporters)
    const reportCount = await db
      .select({ count: count() })
      .from(safetyReports)
      .where(eq(safetyReports.reportedUserId, reportedUserId))

    const totalReports = reportCount[0]?.count || 0

    // Update user's safety report count
    await db
      .update(users)
      .set({ safetyReportsCount: totalReports })
      .where(eq(users.id, reportedUserId))

    // AUTOMATIC SUSPENSION: If 2+ reports from different users, suspend the account
    if (totalReports >= 2) {
      await db
        .update(users)
        .set({
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: 'This account has been temporarily suspended due to multiple safety reports.',
          canAppealSuspension: true
        })
        .where(eq(users.id, reportedUserId))

      // Mark all pending reports as "action_taken"
      await db
        .update(safetyReports)
        .set({ status: 'action_taken' })
        .where(
          and(
            eq(safetyReports.reportedUserId, reportedUserId),
            eq(safetyReports.status, 'pending')
          )
        )

      // @todo FEATURE: Send email notification to suspended user
      // @todo FEATURE: Send notification to platform admins
    }

    return NextResponse.json({
      success: true,
      report: newReport,
      suspended: totalReports >= 2
    })

  } catch (error) {
    console.error('Error submitting safety report:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}

/**
 * Verify that reporter has legitimate task interaction history with reported user
 *
 * Valid scenarios:
 * 1. Customer created task → Professional applied → Application accepted → Task completed/cancelled
 * 2. Professional applied to task → Customer accepted → Worked together
 *
 * @param reporterId - User submitting the report
 * @param reportedUserId - User being reported
 * @returns true if they have worked together, false otherwise
 */
async function verifyTaskInteraction(
  reporterId: string,
  reportedUserId: string
): Promise<boolean> {
  try {
    // Scenario 1: Reporter is CUSTOMER, Reported is PROFESSIONAL
    // Customer posted task → Professional applied → Application was accepted
    const customerReportingProfessional = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.customerId, reporterId),
        eq(tasks.selectedProfessionalId, reportedUserId)
      ),
      with: {
        applications: {
          where: and(
            eq(applications.professionalId, reportedUserId),
            eq(applications.status, 'accepted')
          )
        }
      }
    })

    if (customerReportingProfessional && customerReportingProfessional.applications.length > 0) {
      return true // Customer hired this professional
    }

    // Scenario 2: Reporter is PROFESSIONAL, Reported is CUSTOMER
    // Professional applied to customer's task → Application was accepted
    const professionalReportingCustomer = await db.query.applications.findFirst({
      where: and(
        eq(applications.professionalId, reporterId),
        eq(applications.status, 'accepted')
      ),
      with: {
        task: {
          where: eq(tasks.customerId, reportedUserId)
        }
      }
    })

    if (professionalReportingCustomer && professionalReportingCustomer.task) {
      return true // Professional worked for this customer
    }

    return false // No task interaction history found

  } catch (error) {
    console.error('Error verifying task interaction:', error)
    return false // Fail closed - deny if verification fails
  }
}

/**
 * City Migration Test Script
 *
 * Tests the city slug normalization migration
 * Runs verification queries to ensure all cities are normalized
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const VALID_SLUGS = ['sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven']

async function testMigration() {
  console.log('🧪 Testing City Migration')
  console.log('=' .repeat(60))
  console.log()

  let hasErrors = false

  // Test 1: Check tasks city distribution
  console.log('📋 Test 1: Tasks City Distribution')
  console.log('-'.repeat(60))

  const { data: tasksCities, error: tasksError } = await supabase
    .from('tasks')
    .select('city')
    .not('city', 'is', null)

  if (tasksError) {
    console.error('❌ Error querying tasks:', tasksError.message)
    hasErrors = true
  } else {
    const cityCounts = tasksCities.reduce((acc, task) => {
      const city = task.city || 'NULL'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)

    console.log('City Slug                               | Count')
    console.log('-'.repeat(60))
    sorted.forEach(([city, count]) => {
      const isValid = VALID_SLUGS.includes(city)
      const status = isValid ? '✅' : '❌'
      console.log(`${status} ${city.padEnd(37)} | ${count}`)
      if (!isValid) hasErrors = true
    })
    console.log()
  }

  // Test 2: Check users city distribution
  console.log('👤 Test 2: Users City Distribution')
  console.log('-'.repeat(60))

  const { data: usersCities, error: usersError } = await supabase
    .from('users')
    .select('city')
    .not('city', 'is', null)

  if (usersError) {
    console.error('❌ Error querying users:', usersError.message)
    hasErrors = true
  } else {
    const cityCounts = usersCities.reduce((acc, user) => {
      const city = user.city || 'NULL'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)

    console.log('City Slug                               | Count')
    console.log('-'.repeat(60))
    if (sorted.length === 0) {
      console.log('(No users with city set)')
    } else {
      sorted.forEach(([city, count]) => {
        const isValid = VALID_SLUGS.includes(city)
        const status = isValid ? '✅' : '❌'
        console.log(`${status} ${city.padEnd(37)} | ${count}`)
        if (!isValid) hasErrors = true
      })
    }
    console.log()
  }

  // Test 3: Check for invalid city values in tasks
  console.log('🔍 Test 3: Invalid City Values Check')
  console.log('-'.repeat(60))

  const { data: invalidTasks, error: invalidTasksError } = await supabase
    .from('tasks')
    .select('id, city, title')
    .not('city', 'in', `(${VALID_SLUGS.join(',')})`)

  if (invalidTasksError) {
    console.error('❌ Error checking invalid tasks:', invalidTasksError.message)
    hasErrors = true
  } else {
    if (invalidTasks.length === 0) {
      console.log('✅ No invalid city values found in tasks table')
    } else {
      console.error(`❌ Found ${invalidTasks.length} tasks with invalid city values:`)
      invalidTasks.slice(0, 5).forEach((task) => {
        console.error(`   Task ${task.id}: "${task.city}" - ${task.title}`)
      })
      if (invalidTasks.length > 5) {
        console.error(`   ... and ${invalidTasks.length - 5} more`)
      }
      hasErrors = true
    }
  }
  console.log()

  // Test 4: Check for invalid city values in users
  const { data: invalidUsers, error: invalidUsersError } = await supabase
    .from('users')
    .select('id, city, full_name')
    .not('city', 'is', null)
    .not('city', 'in', `(${VALID_SLUGS.join(',')})`)

  if (invalidUsersError) {
    console.error('❌ Error checking invalid users:', invalidUsersError.message)
    hasErrors = true
  } else {
    if (invalidUsers.length === 0) {
      console.log('✅ No invalid city values found in users table')
    } else {
      console.error(`❌ Found ${invalidUsers.length} users with invalid city values:`)
      invalidUsers.slice(0, 5).forEach((user) => {
        console.error(`   User ${user.id}: "${user.city}" - ${user.full_name}`)
      })
      if (invalidUsers.length > 5) {
        console.error(`   ... and ${invalidUsers.length - 5} more`)
      }
      hasErrors = true
    }
  }
  console.log()

  // Final Report
  console.log('=' .repeat(60))
  if (hasErrors) {
    console.error('❌ MIGRATION TEST FAILED')
    console.error('   Please review errors above and fix before deploying.')
    process.exit(1)
  } else {
    console.log('✅ MIGRATION TEST PASSED')
    console.log('   All city values are normalized to valid slugs!')
    console.log()
    console.log('Next Steps:')
    console.log('1. Review the city distribution above')
    console.log('2. Ready to apply migration to production')
    console.log('3. Remember to backup database before production migration')
  }
}

// Run test
testMigration().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

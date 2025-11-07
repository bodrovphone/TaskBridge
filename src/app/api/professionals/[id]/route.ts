import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Use service role to bypass RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

type UserProfile = Database['public']['Tables']['users']['Row'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format to prevent errors with .map files, etc.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid professional ID format' },
        { status: 404 }
      );
    }

    console.log('🔍 Fetching professional with ID:', id);

    // Fetch professional data from users table (bypasses RLS with service role)
    const { data: professional, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { error: 'Professional not found', details: error.message },
        { status: 404 }
      );
    }

    if (!professional) {
      console.error('❌ Professional not found in database');
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    console.log('✅ Professional found:', professional.full_name);

    // @todo: Fetch additional data in parallel
    // - reviews (from reviews table)
    // - portfolio items (from portfolio table)
    // - completed tasks (from tasks table where selected_professional_id = id)
    // - services (from service_categories array or separate services table)

    // Transform to match frontend expectations using actual database column names
    const transformedProfessional = {
      id: professional.id,
      fullName: professional.full_name,
      email: professional.email,
      avatarUrl: professional.avatar_url,
      bio: professional.bio || 'Професионален специалист',
      phone: professional.phone,
      phoneVerified: professional.is_phone_verified || false,
      idVerified: professional.is_vat_verified || false, // Using VAT verification as ID verification
      addressVerified: false, // Column doesn't exist yet in schema
      location: professional.city,
      city: professional.city,
      neighborhood: professional.neighborhood,
      specialization: professional.professional_title || 'Услуги',
      yearsExperience: professional.years_experience || 0,
      hourlyRate: professional.hourly_rate_bgn || 0,
      isOnline: professional.availability_status === 'online',
      rating: professional.average_rating || 0,
      reviewsCount: professional.total_reviews || 0,
      completedJobs: professional.tasks_completed || 0,
      createdAt: professional.created_at,
      updatedAt: professional.updated_at,

      // Mock data until we have real tables
      services: [],
      portfolio: [],
      reviews: [],
      completedTasksList: [],
      responseTime: professional.response_time_hours
        ? `${professional.response_time_hours} часа`
        : "2 часа",
      safetyStatus: {
        phoneVerified: professional.is_phone_verified || false,
        profileComplete: !!(professional.full_name && professional.bio && professional.city),
        policeCertificate: false, // Not yet in schema
        backgroundCheckPassed: false // Not yet in schema
      },
      contactSettings: {
        allowDirectContact: true,
        preferredHours: "9:00 - 18:00",
        contactMethods: ["message", "phone"]
      }
    };

    return NextResponse.json({ professional: transformedProfessional });
  } catch (error) {
    console.error('Error fetching professional:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

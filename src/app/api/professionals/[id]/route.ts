import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS, ru } from 'date-fns/locale';

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

// Helper function to get date-fns locale
function getDateLocale(lang?: string) {
  switch(lang) {
    case 'bg': return bg;
    case 'ru': return ru;
    case 'en': return enUS;
    default: return bg; // Default to Bulgarian
  }
}

// Helper function to determine task complexity
function determineComplexity(budget: number, duration: number): 'Simple' | 'Standard' | 'Complex' {
  // Complex: High budget OR long duration
  if (budget > 150 || duration > 6) return 'Complex';

  // Simple: Low budget AND short duration
  if (budget < 60 && duration < 2) return 'Simple';

  // Everything else is standard
  return 'Standard';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get locale from query parameter
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'bg';

    // Validate UUID format to prevent errors with .map files, etc.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid professional ID format' },
        { status: 404 }
      );
    }

    console.log('🔍 Fetching professional with ID:', id, 'lang:', lang);

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

    // Fetch completed tasks and reviews in parallel
    const [
      { data: completedTasksData, error: tasksError },
      { data: reviewsData, error: reviewsError }
    ] = await Promise.all([
      supabaseAdmin
      .from('tasks')
      .select(`
        id,
        title,
        category,
        subcategory,
        budget_max_bgn,
        budget_min_bgn,
        city,
        neighborhood,
        completed_at,
        estimated_duration_hours,
        customer:customer_id(
          full_name,
          avatar_url,
          is_phone_verified,
          is_email_verified
        ),
        task_review:reviews!reviews_task_id_fkey(
          rating,
          comment
        )
      `)
      .eq('selected_professional_id', id)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20),
      supabaseAdmin
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          communication_rating,
          quality_rating,
          professionalism_rating,
          timeliness_rating,
          is_anonymous,
          reviewer:reviewer_id(
            full_name,
            avatar_url
          ),
          task:task_id(
            title,
            category,
            subcategory
          )
        `)
        .eq('reviewee_id', id)
        .eq('review_type', 'customer_to_professional')
        .eq('is_hidden', false)
        .lte('published_at', new Date().toISOString())  // Only published reviews
        .order('created_at', { ascending: false })
        .limit(15)
    ]);

    if (tasksError) {
      console.error('⚠️ Error fetching completed tasks:', tasksError);
      // Don't fail the whole request, just log the error
    }

    if (reviewsError) {
      console.error('⚠️ Error fetching reviews:', reviewsError);
      // Don't fail the whole request, just log the error
    }

    console.log(`📋 Found ${completedTasksData?.length || 0} completed tasks`);
    console.log(`⭐ Found ${reviewsData?.length || 0} reviews`);

    // Transform reviews to UI format
    const transformedReviews = (reviewsData || []).map((review: any) => ({
      id: review.id,
      clientName: review.is_anonymous ? 'Anonymous Customer' : (review.reviewer?.full_name || 'Unknown'),
      clientAvatar: review.is_anonymous ? null : review.reviewer?.avatar_url,
      rating: review.rating,
      comment: review.comment || '',
      date: formatDistanceToNow(new Date(review.created_at), {
        addSuffix: true,
        locale: getDateLocale(lang)
      }),
      verified: true, // All reviews from completed tasks are verified
      anonymous: review.is_anonymous || false,
      isVisible: true,
      visibilityReason: 'visible_high_rating' as const,
      communicationRating: review.communication_rating,
      qualityRating: review.quality_rating,
      professionalismRating: review.professionalism_rating,
      timelinessRating: review.timeliness_rating
    }));

    // @todo: Fetch additional data in parallel
    // - portfolio items (from portfolio table)
    // - services (from service_categories array or separate services table)

    // Transform completed tasks for frontend (returns raw slugs for client-side translation)
    const completedTasksList = completedTasksData?.map((task: any) => {
      const customer = task.customer;
      const budget = task.budget_max_bgn || task.budget_min_bgn || 0;
      const duration = task.estimated_duration_hours || 0;

      // Get review data for this task (customer's review of the professional)
      const taskReview = Array.isArray(task.task_review)
        ? task.task_review.find((r: any) => r.rating !== null)
        : task.task_review;

      return {
        id: task.id,
        title: task.title,
        // Return raw subcategory slug - frontend will translate using getCategoryLabelBySlug()
        categorySlug: task.subcategory || task.category,
        // Return raw city slug and neighborhood - frontend will translate using getCityLabelBySlug()
        citySlug: task.city,
        neighborhood: task.neighborhood,
        completedDate: task.completed_at,
        // Get actual rating from review, or null if no review yet
        clientRating: taskReview?.rating || 0,
        budget: budget,
        durationHours: duration,
        clientId: customer?.id,
        clientName: customer?.full_name || 'Анонимен клиент',
        clientAvatar: customer?.avatar_url,
        // Get testimonial from review comment
        testimonial: taskReview?.comment || undefined,
        isVerified: customer?.is_phone_verified || customer?.is_email_verified || false,
        complexity: determineComplexity(budget, duration)
      };
    }) || [];

    // Access translation fields (cast to any for fields added by migration)
    const profAny = professional as any;
    const contentSourceLang = profAny.content_source_language || 'bg';

    // Determine if we should use Bulgarian translations
    // Use BG translations when: viewer is BG AND original content is NOT BG AND translations exist
    const useBgTranslations = lang === 'bg' && contentSourceLang !== 'bg';

    // Get the appropriate content (translated or original)
    const displayBio = useBgTranslations && profAny.bio_bg
      ? profAny.bio_bg
      : professional.bio;

    const displayTitle = useBgTranslations && profAny.professional_title_bg
      ? profAny.professional_title_bg
      : professional.professional_title;

    const displayServices = useBgTranslations && profAny.services_bg && Array.isArray(profAny.services_bg)
      ? profAny.services_bg
      : professional.services || [];

    // Transform to match frontend expectations using actual database column names
    const transformedProfessional = {
      id: professional.id,
      fullName: professional.full_name,
      email: professional.email,
      avatarUrl: professional.avatar_url,
      bio: displayBio,
      phone: professional.phone,
      phoneVerified: professional.is_phone_verified || false,
      idVerified: professional.is_vat_verified || false, // Using VAT verification as ID verification
      addressVerified: false, // Column doesn't exist yet in schema
      location: professional.city,
      city: professional.city,
      specialization: displayTitle,
      yearsExperience: professional.years_experience || 0,
      hourlyRate: professional.hourly_rate_bgn || 0,
      isOnline: professional.availability_status === 'online',
      rating: professional.average_rating || 0,
      reviewsCount: professional.total_reviews || 0,
      // Use actual count of completed tasks instead of potentially stale counter
      completedJobs: completedTasksList.length,
      createdAt: professional.created_at,
      updatedAt: professional.updated_at,

      // Badge data (cast to any to access fields added by migration)
      is_top_professional: profAny.is_top_professional || false,
      top_professional_tasks_count: profAny.top_professional_tasks_count || 0,
      top_professional_until: profAny.top_professional_until || null,
      is_early_adopter: profAny.is_early_adopter || false,
      early_adopter_categories: profAny.early_adopter_categories || [],
      is_featured: profAny.is_featured || false,

      // Real data from database
      completedTasksList: completedTasksList,
      gallery: professional.portfolio || [],
      services: displayServices,
      serviceCategories: professional.service_categories || [],
      reviews: transformedReviews,
      responseTimeHours: professional.response_time_hours || null,
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
      },
      // Translation metadata (useful for debugging)
      _translationInfo: useBgTranslations ? {
        translatedFrom: contentSourceLang,
        fieldsTranslated: ['bio', 'specialization', 'services'].filter(f =>
          (f === 'bio' && profAny.bio_bg) ||
          (f === 'specialization' && profAny.professional_title_bg) ||
          (f === 'services' && profAny.services_bg)
        )
      } : null
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

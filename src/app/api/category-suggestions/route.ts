/**
 * Category Suggestions API
 * POST /api/category-suggestions - Submit new category suggestion
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST - Submit new category suggestion
 *
 * Requirements:
 * - User must be authenticated (prevents spam)
 * - Suggestion text must be 10-500 characters
 * - Stores in category_suggestions table for admin review
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Authentication required to submit suggestions',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { suggestion } = body;

    // Validate required field
    if (!suggestion || typeof suggestion !== 'string') {
      return NextResponse.json(
        { error: 'Suggestion text is required' },
        { status: 400 }
      );
    }

    // Validate length constraints
    const trimmedSuggestion = suggestion.trim();
    if (trimmedSuggestion.length < 10) {
      return NextResponse.json(
        { error: 'Suggestion must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (trimmedSuggestion.length > 500) {
      return NextResponse.json(
        { error: 'Suggestion must be at most 500 characters' },
        { status: 400 }
      );
    }

    // Create suggestion in database
    const { data: categorySuggestion, error: createError } = await supabase
      .from('category_suggestions')
      .insert({
        user_id: user.id,
        suggestion_text: trimmedSuggestion,
        status: 'pending'
      })
      .select('id, suggestion_text, status, created_at')
      .single();

    if (createError) {
      console.error('[CategorySuggestions] Error creating suggestion:', createError);
      return NextResponse.json(
        { error: 'Failed to submit suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll review your suggestion within 24 hours.",
      suggestion: categorySuggestion
    }, { status: 201 });

  } catch (error) {
    console.error('[CategorySuggestions] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

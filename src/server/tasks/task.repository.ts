/**
 * Task Repository
 * Handles all database operations for tasks
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DatabaseError } from '../shared/errors'
import { Result, ok, err } from '../shared/result'
import type { Task, TaskDbInsert } from './task.types'
import { generateSlug, makeSlugUnique } from '@/lib/utils/transliterate'
import { getCategoryLabelForSlug } from '@/features/categories'

/**
 * Result from full-text search RPC function
 */
interface TextSearchResult {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  city: string
  neighborhood: string
  budget_min_bgn: number | null
  budget_max_bgn: number | null
  budget_type: string
  deadline: string | null
  status: string
  customer_id: string
  images: string[] | null
  is_urgent: boolean
  created_at: string
  search_rank: number
}

export class TaskRepository {
  /**
   * Generate a unique slug for a task
   * Uses title + city + translated category, with collision detection
   * Category is translated to source language for consistency (all parts in same language)
   */
  async generateUniqueSlug(
    title: string,
    city: string,
    category: string,
    sourceLocale: string = 'bg'
  ): Promise<string> {
    // Translate category to source language for consistent slug
    // e.g., 'appliance-repair' → 'Ремонт на уреди' (bg) → 'remont-na-uredi'
    const locale = (sourceLocale === 'en' || sourceLocale === 'ru') ? sourceLocale : 'bg'
    const translatedCategory = getCategoryLabelForSlug(category, locale as 'bg' | 'en' | 'ru')

    // Generate base slug from title + city + translated category
    const slugBase = [title, city, translatedCategory].filter(Boolean).join(' ').trim()
    const baseSlug = generateSlug(slugBase, 80)

    if (!baseSlug) {
      // Fallback to random slug if no meaningful text
      return `task-${Date.now()}`
    }

    // Check for existing slugs with same prefix
    const supabase = createAdminClient()
    const { data: existingSlugs } = await supabase
      .from('tasks')
      .select('slug')
      .like('slug', `${baseSlug}%`)

    const slugList = (existingSlugs || []).map(s => s.slug).filter(Boolean) as string[]
    return makeSlugUnique(baseSlug, slugList)
  }

  /**
   * Create a new task
   */
  async create(data: TaskDbInsert): Promise<Result<Task, DatabaseError>> {
    try {
      const supabase = await createClient()

      // Generate unique slug (title + city + translated category) with fallback
      try {
        const uniqueSlug = await this.generateUniqueSlug(
          data.title,
          data.city,
          data.category,
          data.source_language || 'bg'
        )
        data = { ...data, slug: uniqueSlug }
      } catch (slugError) {
        // If slug generation fails, continue without slug (will use UUID)
        console.warn('Slug generation failed, continuing without slug:', slugError)
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert(data)
        .select()
        .single()

      // Handle unique constraint violation - retry with incremental suffix
      if (error?.code === '23505' && data.slug) {
        console.warn('Slug collision detected, retrying with incremental suffix')

        // Re-fetch existing slugs and find next available number
        const supabaseAdmin = createAdminClient()
        const { data: existingSlugs } = await supabaseAdmin
          .from('tasks')
          .select('slug')
          .like('slug', `${data.slug}%`)

        const slugList = (existingSlugs || []).map(s => s.slug).filter(Boolean) as string[]
        const retrySlug = makeSlugUnique(data.slug, slugList)

        const { data: retryTask, error: retryError } = await supabase
          .from('tasks')
          .insert({ ...data, slug: retrySlug })
          .select()
          .single()

        if (retryError) {
          console.error('Database error creating task (retry):', retryError)
          return err(
            new DatabaseError('Failed to create task', {
              code: retryError.code,
              message: retryError.message
            })
          )
        }

        return ok(retryTask as Task)
      }

      if (error) {
        console.error('Database error creating task:', error)
        return err(
          new DatabaseError('Failed to create task', {
            code: error.code,
            message: error.message
          })
        )
      }

      if (!task) {
        return err(new DatabaseError('Task creation returned no data'))
      }

      return ok(task as Task)
    } catch (error) {
      console.error('Unexpected error creating task:', error)
      return err(new DatabaseError('Unexpected error creating task'))
    }
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Result<Task | null, DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        // Not found is not an error, it's a valid result
        if (error.code === 'PGRST116') {
          return ok(null)
        }

        console.error('Database error finding task:', error)
        return err(
          new DatabaseError('Failed to find task', {
            code: error.code,
            message: error.message
          })
        )
      }

      return ok(task as Task)
    } catch (error) {
      console.error('Unexpected error finding task:', error)
      return err(new DatabaseError('Unexpected error finding task'))
    }
  }

  /**
   * Find task by slug
   */
  async findBySlug(slug: string): Promise<Result<Task | null, DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        // Not found is not an error, it's a valid result
        if (error.code === 'PGRST116') {
          return ok(null)
        }

        console.error('Database error finding task by slug:', error)
        return err(
          new DatabaseError('Failed to find task by slug', {
            code: error.code,
            message: error.message
          })
        )
      }

      return ok(task as Task)
    } catch (error) {
      console.error('Unexpected error finding task by slug:', error)
      return err(new DatabaseError('Unexpected error finding task by slug'))
    }
  }

  /**
   * Find all tasks by customer ID
   */
  async findByCustomerId(customerId: string): Promise<Result<Task[], DatabaseError>> {
    try {
      const supabase = await createClient()

      // Count only pending applications (not rejected/withdrawn)
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          applications!applications_task_id_fkey(count)
        `)
        .eq('customer_id', customerId)
        .eq('applications.status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error finding tasks by customer:', error)
        return err(
          new DatabaseError('Failed to find tasks', {
            code: error.code,
            message: error.message
          })
        )
      }

      // Map tasks to include applicationsCount
      const tasksWithCount = (tasks || []).map((task: any) => ({
        ...task,
        applicationsCount: task?.applications?.[0]?.count || 0,
        applications: undefined // Remove the nested structure
      }))

      return ok(tasksWithCount as Task[])
    } catch (error) {
      console.error('Unexpected error finding tasks:', error)
      return err(new DatabaseError('Unexpected error finding tasks'))
    }
  }

  /**
   * Find open tasks (for browse page)
   */
  async findOpenTasks(limit = 20): Promise<Result<Task[], DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Database error finding open tasks:', error)
        return err(
          new DatabaseError('Failed to find open tasks', {
            code: error.code,
            message: error.message
          })
        )
      }

      return ok((tasks || []) as Task[])
    } catch (error) {
      console.error('Unexpected error finding open tasks:', error)
      return err(new DatabaseError('Unexpected error finding open tasks'))
    }
  }

  /**
   * Find featured tasks (high-quality tasks with diversity)
   *
   * Scoring criteria:
   * - Has images: +3 points
   * - Long description (>50 chars): +2 points
   * - Category diversity: Prefer different categories
   *
   * Returns top 20 tasks by quality score
   */
  async findFeaturedTasks(): Promise<Result<Task[], DatabaseError>> {
    try {
      console.log('[TaskRepository] findFeaturedTasks: Starting query')
      // Use admin client for static generation (no cookies dependency)
      const supabase = createAdminClient()

      // @todo TEMPORARY: Remove 'cancelled' from status filter once we have more real tasks
      // Fetch all recent tasks including cancelled for diversity selection
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .in('status', ['open', 'in_progress', 'completed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(50) // Fetch 50 to ensure category diversity

      if (error) {
        console.error('[TaskRepository] findFeaturedTasks: Database error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return err(
          new DatabaseError('Failed to find featured tasks', {
            code: error.code,
            message: error.message
          })
        )
      }

      if (!tasks || tasks.length === 0) {
        console.log('[TaskRepository] findFeaturedTasks: No tasks found in database')
        return ok([])
      }

      console.log('[TaskRepository] findFeaturedTasks: Found', tasks.length, 'tasks')

      // Score and select featured tasks
      const scoredTasks = tasks.map((task: Task) => {
        let score = 0

        // Has images: +3 points
        if (task.images && task.images.length > 0) {
          score += 3
        }

        // Long description: +2 points
        if (task.description && task.description.length > 50) {
          score += 2
        }

        return { task, score }
      })

      // Sort by score descending
      scoredTasks.sort((a, b) => b.score - a.score)

      // Select top 20 with category diversity
      const selectedTasks: Task[] = []
      const usedCategories = new Set<string>()

      // First pass: add high-scoring tasks from unique categories
      for (const { task } of scoredTasks) {
        if (selectedTasks.length >= 20) break

        const categoryKey = task.subcategory || task.category
        if (!usedCategories.has(categoryKey)) {
          selectedTasks.push(task)
          usedCategories.add(categoryKey)
        }
      }

      // Second pass: fill remaining slots with highest scores
      if (selectedTasks.length < 20) {
        for (const { task } of scoredTasks) {
          if (selectedTasks.length >= 20) break
          if (!selectedTasks.find(t => t.id === task.id)) {
            selectedTasks.push(task)
          }
        }
      }

      console.log('[TaskRepository] findFeaturedTasks: Returning', selectedTasks.length, 'featured tasks')
      return ok(selectedTasks)
    } catch (error) {
      console.error('[TaskRepository] findFeaturedTasks: Unexpected error:', error)
      return err(new DatabaseError('Unexpected error finding featured tasks'))
    }
  }

  /**
   * Update task
   */
  async update(
    id: string,
    updates: Partial<Task>
  ): Promise<Result<Task, DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Database error updating task:', error)
        return err(
          new DatabaseError('Failed to update task', {
            code: error.code,
            message: error.message
          })
        )
      }

      if (!task) {
        return err(new DatabaseError('Task update returned no data'))
      }

      return ok(task as Task)
    } catch (error) {
      console.error('Unexpected error updating task:', error)
      return err(new DatabaseError('Unexpected error updating task'))
    }
  }

  /**
   * Delete task (soft delete by status)
   */
  async delete(id: string): Promise<Result<void, DatabaseError>> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('tasks')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) {
        console.error('Database error deleting task:', error)
        return err(
          new DatabaseError('Failed to delete task', {
            code: error.code,
            message: error.message
          })
        )
      }

      return ok(undefined)
    } catch (error) {
      console.error('Unexpected error deleting task:', error)
      return err(new DatabaseError('Unexpected error deleting task'))
    }
  }

  /**
   * Find many tasks with flexible filtering, sorting, and pagination
   * Main query method that powers all use cases
   */
  async findMany(
    options: import('./task.query-types').TaskQueryOptions
  ): Promise<Result<import('./task.query-types').PaginatedTasksResponse<Task>, DatabaseError>> {
    try {
      // Use admin client to bypass RLS for public task viewing
      // Privacy filtering is applied at service layer via applyPrivacyFilter()
      const supabase = createAdminClient()

      // Start query builder with count of PENDING applications only, and professional details
      let query = supabase
        .from('tasks')
        .select(`
          *,
          applications!applications_task_id_fkey(count),
          professional:users!selected_professional_id(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('applications.status', 'pending')

      // Apply filters
      if (options.filters.customerId) {
        query = query.eq('customer_id', options.filters.customerId)
      }

      if (options.filters.status && options.filters.status.length > 0) {
        query = query.in('status', options.filters.status)
      }

      if (options.filters.category) {
        query = query.eq('category', options.filters.category)
      }

      if (options.filters.subcategory) {
        query = query.eq('subcategory', options.filters.subcategory)
      }

      if (options.filters.city) {
        query = query.eq('city', options.filters.city)
      }

      if (options.filters.neighborhood) {
        query = query.eq('neighborhood', options.filters.neighborhood)
      }

      if (options.filters.isUrgent !== undefined) {
        query = query.eq('is_urgent', options.filters.isUrgent)
      }

      if (options.filters.budgetMin !== undefined) {
        query = query.gte('budget_min_bgn', options.filters.budgetMin)
      }

      if (options.filters.budgetMax !== undefined) {
        query = query.lte('budget_max_bgn', options.filters.budgetMax)
      }

      // Apply sorting
      query = query.order(options.sort.field, {
        ascending: options.sort.ascending
      })

      // If sorting by urgent, add secondary sort by created_at
      if (options.sort.field === 'is_urgent') {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      query = query.range(
        options.pagination.offset,
        options.pagination.offset + options.pagination.limit - 1
      )

      // Execute query
      const { data: tasks, error, count } = await query

      if (error) {
        console.error('Database error finding tasks:', error)
        return err(
          new DatabaseError('Failed to find tasks', {
            code: error.code,
            message: error.message
          })
        )
      }

      // Calculate pagination metadata
      const total = count || 0
      const totalPages = Math.ceil(total / options.pagination.limit)

      // Map tasks to include applicationsCount
      const tasksWithCount = (tasks || []).map((task: any) => ({
        ...task,
        applicationsCount: task?.applications?.[0]?.count || 0,
        applications: undefined // Remove the nested structure
      }))

      return ok({
        tasks: tasksWithCount as Task[],
        pagination: {
          page: options.pagination.page,
          limit: options.pagination.limit,
          total,
          totalPages,
          hasNext: options.pagination.page < totalPages,
          hasPrevious: options.pagination.page > 1
        }
      })
    } catch (error) {
      console.error('Unexpected error finding tasks:', error)
      return err(new DatabaseError('Unexpected error finding tasks'))
    }
  }

  /**
   * Find single task by ID with related counts and customer data
   */
  async findByIdWithRelations(
    id: string
  ): Promise<Result<Task & { applicationsCount: number }, DatabaseError>> {
    try {
      // Use admin client to bypass RLS for public task viewing
      // Privacy filtering is applied at service layer via applyPrivacyFilter()
      const supabase = createAdminClient()

      // 1. Get task with applications count (pending only)
      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          id, slug, created_at, updated_at, title, description, category, subcategory, city, neighborhood, location_notes, budget_min_bgn, budget_max_bgn, budget_type, deadline, estimated_duration_hours, status, customer_id, selected_professional_id, accepted_application_id, completed_at, completed_by_professional_at, confirmed_by_customer_at, reviewed_by_customer, reviewed_by_professional, cancelled_at, cancelled_by, cancellation_reason, images, documents, views_count, applications_count, is_urgent, requires_license, requires_insurance, source_language, title_bg, description_bg, requirements_bg,
          applications!applications_task_id_fkey(count)
        `)
        .eq('id', id)
        .eq('applications.status', 'pending')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return ok(null as any) // Not found
        }

        console.error('Database error finding task:', error)
        return err(
          new DatabaseError('Failed to find task', {
            code: error.code,
            message: error.message
          })
        )
      }

      // 2. Get customer data separately using admin client (bypasses RLS)
      let customerData = null
      if (task.customer_id) {
        const adminClient = createAdminClient()
        const { data: customer, error: customerError } = await adminClient
          .from('users')
          .select('id, full_name, avatar_url, tasks_completed, created_at, preferred_language')
          .eq('id', task.customer_id)
          .single()

        if (!customerError && customer) {
          customerData = customer
        } else {
          console.warn('⚠️  Customer not found for task:', task.customer_id)
        }
      }

      // Extract applications count from nested query
      const applicationsCount = task?.applications?.[0]?.count || 0

      return ok({
        ...task,
        slug: task.slug || '', // Slug may not exist in DB yet
        customer: customerData,
        applicationsCount
      } as Task & { applicationsCount: number })
    } catch (error) {
      console.error('Unexpected error finding task:', error)
      return err(new DatabaseError('Unexpected error finding task'))
    }
  }

  /**
   * Find task by ID or slug with related counts and customer data
   * Determines if identifier is UUID or slug and calls appropriate method
   */
  async findByIdOrSlugWithRelations(
    identifier: string
  ): Promise<Result<Task & { applicationsCount: number }, DatabaseError>> {
    // UUID v4 pattern: 8-4-4-4-12 hex characters
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

    if (isUuid) {
      return this.findByIdWithRelations(identifier)
    }
    return this.findBySlugWithRelations(identifier)
  }

  /**
   * Find single task by slug with related counts and customer data
   */
  async findBySlugWithRelations(
    slug: string
  ): Promise<Result<Task & { applicationsCount: number }, DatabaseError>> {
    try {
      // Use admin client to bypass RLS for public task viewing
      const supabase = createAdminClient()

      // 1. Get task with applications count (pending only)
      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          id, slug, created_at, updated_at, title, description, category, subcategory, city, neighborhood, location_notes, budget_min_bgn, budget_max_bgn, budget_type, deadline, estimated_duration_hours, status, customer_id, selected_professional_id, accepted_application_id, completed_at, completed_by_professional_at, confirmed_by_customer_at, reviewed_by_customer, reviewed_by_professional, cancelled_at, cancelled_by, cancellation_reason, images, documents, views_count, applications_count, is_urgent, requires_license, requires_insurance, source_language, title_bg, description_bg, requirements_bg,
          applications!applications_task_id_fkey(count)
        `)
        .eq('slug', slug)
        .eq('applications.status', 'pending')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return ok(null as any) // Not found
        }

        console.error('Database error finding task by slug:', error)
        return err(
          new DatabaseError('Failed to find task by slug', {
            code: error.code,
            message: error.message
          })
        )
      }

      // 2. Get customer data separately using admin client (bypasses RLS)
      let customerData = null
      if (task.customer_id) {
        const adminClient = createAdminClient()
        const { data: customer, error: customerError } = await adminClient
          .from('users')
          .select('id, full_name, avatar_url, tasks_completed, created_at, preferred_language')
          .eq('id', task.customer_id)
          .single()

        if (!customerError && customer) {
          customerData = customer
        } else {
          console.warn('⚠️  Customer not found for task:', task.customer_id)
        }
      }

      // Extract applications count from nested query
      const applicationsCount = task?.applications?.[0]?.count || 0

      return ok({
        ...task,
        slug: task.slug || '',
        customer: customerData,
        applicationsCount
      } as Task & { applicationsCount: number })
    } catch (error) {
      console.error('Unexpected error finding task by slug:', error)
      return err(new DatabaseError('Unexpected error finding task by slug'))
    }
  }

  /**
   * Full-text search for tasks using PostgreSQL tsvector
   * Searches title, title_bg, description, description_bg, and location_notes
   * Results are ranked by relevance
   */
  async searchByText(
    searchQuery: string,
    options: {
      status?: string
      city?: string
      category?: string
      limit?: number
    } = {}
  ): Promise<Result<(Task & { searchRank: number })[], DatabaseError>> {
    try {
      const supabase = createAdminClient()

      const { data, error } = await supabase.rpc('search_tasks_by_text', {
        search_query: searchQuery,
        status_filter: options.status || 'open',
        city_filter: options.city || null,
        category_filter: options.category || null,
        result_limit: options.limit || 20
      })

      if (error) {
        console.error('Database error searching tasks:', error)
        return err(
          new DatabaseError('Failed to search tasks', {
            code: error.code,
            message: error.message
          })
        )
      }

      // Map results to Task format with search rank
      const tasks = (data as TextSearchResult[] || []).map((result) => ({
        id: result.id,
        title: result.title,
        description: result.description,
        category: result.category,
        subcategory: result.subcategory,
        city: result.city,
        neighborhood: result.neighborhood,
        budget_min_bgn: result.budget_min_bgn,
        budget_max_bgn: result.budget_max_bgn,
        budget_type: result.budget_type,
        deadline: result.deadline,
        status: result.status,
        customer_id: result.customer_id,
        images: result.images,
        is_urgent: result.is_urgent,
        created_at: result.created_at,
        searchRank: result.search_rank
      })) as (Task & { searchRank: number })[]

      return ok(tasks)
    } catch (error) {
      console.error('Unexpected error searching tasks:', error)
      return err(new DatabaseError('Unexpected error searching tasks'))
    }
  }
}

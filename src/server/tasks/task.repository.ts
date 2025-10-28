/**
 * Task Repository
 * Handles all database operations for tasks
 */

import { createClient } from '@/lib/supabase/server'
import { DatabaseError } from '../shared/errors'
import { Result, ok, err } from '../shared/result'
import type { Task, TaskDbInsert } from './task.types'

export class TaskRepository {
  /**
   * Create a new task
   */
  async create(data: TaskDbInsert): Promise<Result<Task, DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: task, error } = await supabase
        .from('tasks')
        .insert(data)
        .select()
        .single()

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
   * Find all tasks by customer ID
   */
  async findByCustomerId(customerId: string): Promise<Result<Task[], DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('customer_id', customerId)
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

      return ok((tasks || []) as Task[])
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
      const supabase = await createClient()

      // Start query builder with count
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' })

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

      if (options.filters.search) {
        // Full-text search in title and description
        query = query.or(
          `title.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`
        )
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

      return ok({
        tasks: (tasks || []) as Task[],
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
   * Find single task by ID with related counts
   */
  async findByIdWithRelations(
    id: string
  ): Promise<Result<Task & { applicationsCount: number }, DatabaseError>> {
    try {
      const supabase = await createClient()

      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          applications(count)
        `)
        .eq('id', id)
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

      // Extract applications count from nested query
      const applicationsCount = task?.applications?.[0]?.count || 0

      return ok({
        ...task,
        applicationsCount
      } as Task & { applicationsCount: number })
    } catch (error) {
      console.error('Unexpected error finding task:', error)
      return err(new DatabaseError('Unexpected error finding task'))
    }
  }
}

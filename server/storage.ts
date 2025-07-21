import {
  users,
  tasks,
  applications,
  reviews,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Application,
  type InsertApplication,
  type Review,
  type InsertReview,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, like, gte, lte, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: string): Promise<Task | undefined>;
  getTasks(filters?: {
    category?: string;
    city?: string;
    budgetMin?: number;
    budgetMax?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Task[]>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsForTask(taskId: string): Promise<Application[]>;
  getApplicationsForProfessional(professionalId: string): Promise<Application[]>;
  updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  getReviewsForTask(taskId: string): Promise<Review[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    completedTasks: number;
    averageRating: number;
    totalReviews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasks(filters: {
    category?: string;
    city?: string;
    budgetMin?: number;
    budgetMax?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Task[]> {
    const conditions: any[] = [eq(tasks.isActive, true)];

    if (filters.category) {
      conditions.push(eq(tasks.category, filters.category));
    }
    if (filters.city) {
      conditions.push(like(tasks.city, `%${filters.city}%`));
    }
    if (filters.budgetMin) {
      conditions.push(gte(tasks.budgetMin, filters.budgetMin.toString()));
    }
    if (filters.budgetMax) {
      conditions.push(lte(tasks.budgetMax, filters.budgetMax.toString()));
    }
    if (filters.status) {
      conditions.push(eq(tasks.status, filters.status as any));
    }

    let query = db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    await db.update(tasks).set({ isActive: false }).where(eq(tasks.id, id));
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplicationsForTask(taskId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.taskId, taskId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsForProfessional(professionalId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.professionalId, professionalId))
      .orderBy(desc(applications.createdAt));
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update user's average rating
    await this.updateUserRating(review.revieweeId);
    
    return newReview;
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.revieweeId, userId), eq(reviews.isPublished, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForTask(taskId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.taskId, taskId))
      .orderBy(desc(reviews.createdAt));
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    completedTasks: number;
    averageRating: number;
    totalReviews: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { completedTasks: 0, averageRating: 0, totalReviews: 0 };
    }

    const completedTasks = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.selectedProfessionalId, userId),
          eq(tasks.status, "completed")
        )
      );

    return {
      completedTasks: completedTasks[0]?.count || 0,
      averageRating: parseFloat(user.averageRating || "0"),
      totalReviews: user.totalReviews || 0,
    };
  }

  private async updateUserRating(userId: string): Promise<void> {
    const userReviews = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.revieweeId, userId), eq(reviews.isPublished, true)));

    if (userReviews.length > 0) {
      const totalRating = userReviews.reduce((sum, review) => sum + review.overallRating, 0);
      const averageRating = totalRating / userReviews.length;

      await db
        .update(users)
        .set({
          averageRating: averageRating.toFixed(2),
          totalReviews: userReviews.length,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }
}

export const storage = new DatabaseStorage();

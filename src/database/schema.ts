import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  // serial,
  integer,
  decimal,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Session storage table
export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)]
);

// User storage table
export const users = pgTable('users', {
  id: varchar('id').primaryKey().notNull(),
  email: varchar('email').unique(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  userType: varchar('user_type', {
    enum: ['customer', 'professional'],
  }).default('customer'),
  phoneNumber: varchar('phone_number'),
  city: varchar('city'),
  country: varchar('country'),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  isEmailVerified: boolean('is_email_verified').default(false),
  verifiedAt: timestamp('verified_at'),
  preferredLanguage: varchar('preferred_language', {
    enum: ['en', 'bg', 'ru'],
  }).default('en'),
  preferredContact: varchar('preferred_contact', {
    enum: ['email', 'phone', 'sms'],
  }).default('email'),
  vatNumber: varchar('vat_number'),
  isVatVerified: boolean('is_vat_verified').default(false),
  serviceCategories: text('service_categories').array(),
  bio: text('bio'),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default(
    '0'
  ),
  totalReviews: integer('total_reviews').default(0),
  isActive: boolean('is_active').default(true),
  // Safety & Suspension fields
  isSuspended: boolean('is_suspended').default(false),
  suspendedAt: timestamp('suspended_at'),
  suspensionReason: text('suspension_reason'),
  safetyReportsCount: integer('safety_reports_count').default(0),
  canAppealSuspension: boolean('can_appeal_suspension').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category').notNull(),
  subcategory: varchar('subcategory'),
  customerId: varchar('customer_id')
    .notNull()
    .references(() => users.id),
  budgetMin: decimal('budget_min', { precision: 10, scale: 2 }),
  budgetMax: decimal('budget_max', { precision: 10, scale: 2 }),
  budgetType: varchar('budget_type', { enum: ['range', 'fixed'] }).default(
    'range'
  ),
  city: varchar('city').notNull(),
  neighborhood: varchar('neighborhood'),
  exactAddress: text('exact_address'),
  deadline: timestamp('deadline'),
  urgency: varchar('urgency', {
    enum: ['same_day', 'within_week', 'flexible'],
  }).default('flexible'),
  requirements: text('requirements'),
  photos: text('photos').array(),
  status: varchar('status', {
    enum: ['open', 'in_progress', 'completed', 'cancelled', 'expired'],
  }).default('open'),
  selectedProfessionalId: varchar('selected_professional_id').references(
    () => users.id
  ),
  completedAt: timestamp('completed_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id),
  professionalId: varchar('professional_id')
    .notNull()
    .references(() => users.id),
  proposedPrice: decimal('proposed_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  proposedTimeline: varchar('proposed_timeline').notNull(),
  message: text('message'),
  portfolioImages: text('portfolio_images').array(),
  status: varchar('status', {
    enum: ['pending', 'accepted', 'rejected'],
  }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const safetyReports = pgTable('safety_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: varchar('reporter_id')
    .notNull()
    .references(() => users.id),
  reportedUserId: varchar('reported_user_id')
    .notNull()
    .references(() => users.id),
  reportType: varchar('report_type', {
    enum: [
      'fraud_scam',
      'threatening_behavior',
      'harassment',
      'identity_theft',
      'off_platform_payment',
      'poor_quality',
      'no_show',
      'other'
    ],
  }).notNull(),
  description: text('description').notNull(),
  evidenceUrls: text('evidence_urls').array(), // URLs to uploaded evidence images
  relatedTaskId: uuid('related_task_id').references(() => tasks.id), // Optional task reference
  status: varchar('status', {
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
  }).default('pending'),
  adminNotes: text('admin_notes'), // For post-MVP manual review
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id),
  reviewerId: varchar('reviewer_id')
    .notNull()
    .references(() => users.id),
  revieweeId: varchar('reviewee_id')
    .notNull()
    .references(() => users.id),
  reviewerType: varchar('reviewer_type', {
    enum: ['customer', 'professional'],
  }).notNull(),
  qualityRating: integer('quality_rating').notNull(),
  timelinessRating: integer('timeliness_rating').notNull(),
  communicationRating: integer('communication_rating').notNull(),
  overallRating: integer('overall_rating').notNull(),
  writtenReview: text('written_review'),
  isPublished: boolean('is_published').default(false),
  // Review visibility fields for negative review pattern detection
  isVisible: boolean('is_visible').default(true),
  visibilityReason: varchar('visibility_reason', {
    enum: [
      'visible_high_rating',      // ≥4 stars, always visible
      'visible_pattern_detected',  // ≤3 stars, pattern of 3+ negatives found
      'hidden_pending_pattern',    // ≤3 stars, hidden until pattern emerges
    ],
  }).default('visible_high_rating'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks, { relationName: 'customerTasks' }),
  assignedTasks: many(tasks, { relationName: 'professionalTasks' }),
  applications: many(applications),
  givenReviews: many(reviews, { relationName: 'givenReviews' }),
  receivedReviews: many(reviews, { relationName: 'receivedReviews' }),
  submittedReports: many(safetyReports, { relationName: 'submittedReports' }),
  receivedReports: many(safetyReports, { relationName: 'receivedReports' }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  customer: one(users, {
    fields: [tasks.customerId],
    references: [users.id],
    relationName: 'customerTasks',
  }),
  selectedProfessional: one(users, {
    fields: [tasks.selectedProfessionalId],
    references: [users.id],
    relationName: 'professionalTasks',
  }),
  applications: many(applications),
  reviews: many(reviews),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  task: one(tasks, {
    fields: [applications.taskId],
    references: [tasks.id],
  }),
  professional: one(users, {
    fields: [applications.professionalId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  task: one(tasks, {
    fields: [reviews.taskId],
    references: [tasks.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: 'givenReviews',
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: 'receivedReviews',
  }),
}));

export const safetyReportsRelations = relations(safetyReports, ({ one }) => ({
  reporter: one(users, {
    fields: [safetyReports.reporterId],
    references: [users.id],
    relationName: 'submittedReports',
  }),
  reportedUser: one(users, {
    fields: [safetyReports.reportedUserId],
    references: [users.id],
    relationName: 'receivedReports',
  }),
  relatedTask: one(tasks, {
    fields: [safetyReports.relatedTaskId],
    references: [tasks.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSafetyReportSchema = createInsertSchema(safetyReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type SafetyReport = typeof safetyReports.$inferSelect;
export type InsertSafetyReport = z.infer<typeof insertSafetyReportSchema>;

// Task categories
export const TASK_CATEGORIES = {
  home_repair: 'Дом и ремонти',
  delivery_transport: 'Доставки и транспорт',
  personal_care: 'Лична грижа',
  personal_assistant: 'Личен асистент',
  learning_fitness: 'Обучение и фитнес',
  other: 'Други',
} as const;

export const TASK_SUBCATEGORIES = {
  home_repair: [
    'Електричество',
    'Водопровод',
    'Почистване',
    'Поддръжка',
    'Преместване',
  ],
  delivery_transport: [
    'Доставка на пакети',
    'Пазаруване',
    'Транспорт',
    'Куриерски услуги',
  ],
  personal_care: [
    'Грижа за домашни любимци',
    'Детегледане',
    'Грижа за възрастни',
    'Разходка с куче',
  ],
  personal_assistant: [
    'Административни задачи',
    'Поръчки',
    'Помощ при събития',
    'Лични поръчки',
  ],
  learning_fitness: [
    'Частни уроци',
    'Персонален тренинг',
    'Езикови уроци',
    'Музикални уроци',
  ],
  other: ['Други услуги'],
} as const;

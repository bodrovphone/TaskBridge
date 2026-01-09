/**
 * UI Component Types for Professional Detail Page
 *
 * These types define the contract between parent and child components.
 * They represent the transformed/display-ready data shape, not raw API data.
 */

import type { GalleryItem, ServiceItem } from '@/server/domain/user/user.types';
import type { CompletedTaskItem, ReviewItem } from '@/server/professionals/professional.types';

// Re-export ServiceItem for convenience
export type { ServiceItem };

/**
 * Professional data input - supports both database (snake_case) and transformed (camelCase) formats
 * Used as props for ProfessionalDetailPageContent component
 */
export interface ProfessionalDataInput extends Record<string, unknown> {
  // Required fields
  id: string;

  // snake_case fields (from database)
  full_name?: string | null;
  avatar_url?: string | null;
  professional_title?: string | null;
  bio?: string | null;
  city?: string | null;
  years_experience?: number | null;
  tasks_completed?: number;
  average_rating?: number | null;
  total_reviews?: number;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  is_vat_verified?: boolean;
  service_categories?: string[];
  response_time_hours?: number | null;
  is_top_professional?: boolean;
  top_professional_tasks_count?: number;
  is_early_adopter?: boolean;
  early_adopter_categories?: string[];
  is_featured?: boolean;

  // camelCase fields (transformed)
  fullName?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  specialization?: string;
  rating?: number;
  reviewsCount?: number;
  reviewCount?: number;
  completedJobs?: number;
  completedTasks?: number;
  yearsExperience?: number;
  responseTimeHours?: number | null;
  isOnline?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  addressVerified?: boolean;
  verified?: boolean;
  gallery?: GalleryItem[];
  serviceCategories?: string[];
  services?: ServiceItem[];
  reviews?: ReviewItem[];
  completedTasksList?: CompletedTaskItem[];
  isTopProfessional?: boolean;
  topProfessionalTasksCount?: number;
  isEarlyAdopter?: boolean;
  earlyAdopterCategories?: string[];

  // Safety status
  safetyStatus?: {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    profileComplete?: boolean;
    policeCertificate?: boolean;
    backgroundCheckPassed?: boolean;
    cleanSafetyRecord?: boolean;
    hasNegativeReviews?: boolean;
    multipleReports?: boolean;
  };

  // Contact settings
  contactSettings?: {
    allowDirectContact: boolean;
    preferredHours: string;
    contactMethods: string[];
  };

  // Suspension status
  isSuspended?: boolean;
  suspensionReason?: string;
}

/** Safety status for professionals - matches SafetyIndicators component */
export interface SafetyStatusDisplay {
  phoneVerified: boolean;
  emailVerified: boolean;
  profileComplete: boolean;
  policeCertificate: boolean;
  backgroundCheckPassed: boolean;
  cleanSafetyRecord: boolean;
  hasNegativeReviews: boolean;
  multipleReports: boolean;
}

/** Professional data as transformed for UI display */
export interface ProfessionalDisplayData {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  completedTasks: number;
  yearsExperience: number;
  responseTime: string;
  location: string;
  isOnline: boolean;
  isVerified: {
    phone: boolean;
    id: boolean;
    address: boolean;
  };
  safetyStatus: SafetyStatusDisplay;
  bio: string;
  services: ServiceItem[];
  serviceCategories: string[];
  gallery: GalleryItem[];
  reviews: ReviewDisplayItem[];
  completedTasksList: CompletedTaskDisplayItem[];
  contactSettings: {
    allowDirectContact: boolean;
    preferredHours: string;
    contactMethods: string[];
  };
  isTopProfessional?: boolean;
  topProfessionalTasksCount?: number;
  isEarlyAdopter?: boolean;
  earlyAdopterCategories?: string[];
}

/** Review item for display in ReviewsSection */
export interface ReviewDisplayItem {
  id: string;
  clientName: string;
  clientAvatar?: string | null;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  anonymous: boolean;
}

/** Completed task item for display in CompletedTasksSection */
export interface CompletedTaskDisplayItem {
  id: string;
  title: string;
  categorySlug: string;
  citySlug: string | null;
  neighborhood?: string | null;
  completedDate: string | null;
  clientRating: number;
  budget: number;
  durationHours: number;
  clientId?: string;
  clientName: string;
  clientAvatar?: string | null;
  testimonial?: string;
  isVerified: boolean;
  complexity?: 'Simple' | 'Standard' | 'Complex';
}

/** Task item for TaskSelectionModal */
export interface TaskSelectionItem {
  id: string;
  title: string;
  status?: string;
  category?: string;
  budget?: number;
}

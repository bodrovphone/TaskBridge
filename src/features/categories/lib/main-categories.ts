import {
  Home,
  Wrench,
  Truck,
  Sparkles,
  Package,
  Heart,
  Car,
  ShoppingBag,
  PenTool,
  GraduationCap,
  Code,
  Mouse,
  Camera,
  Briefcase,
  PawPrint,
  Scissors,
  PartyPopper,
  Languages,
  Dumbbell,
  HandHeart,
  Settings,
  Sofa,
  MonitorSmartphone,
  CircuitBoard,
  Megaphone,
  Palette,
} from 'lucide-react';
import { MainCategory } from './types';

/**
 * Main Categories - Top-level service categories
 * Expanded from 6 to 26 categories based on Ukrainian platform data
 *
 * Categories are ordered by popularity/task volume:
 * - High demand: Appliance Repair (184k), Courier (122k), Online Work (95k)
 * - Medium demand: Design (35k), Cleaning (35k), Construction (35k)
 * - Growing: AI Services (3k+), Digital Marketing (52k)
 *
 * Each category has:
 * - Unique ID and slug (kebab-case)
 * - Icon from lucide-react
 * - Unique color (used in UI)
 * - Translation key for i18n
 * - Sort order for display
 */
export const MAIN_CATEGORIES: MainCategory[] = [
  // ===== HIGH DEMAND CATEGORIES =====
  {
    id: 'appliance-repair',
    slug: 'appliance-repair',
    icon: Settings,
    color: 'blue',
    translationKey: 'categories.main.applianceRepair',
    sortOrder: 1,
  },
  {
    id: 'courier-services',
    slug: 'courier-services',
    icon: ShoppingBag,
    color: 'green',
    translationKey: 'categories.main.courierServices',
    sortOrder: 2,
  },
  {
    id: 'online-work',
    slug: 'online-work',
    icon: Mouse,
    color: 'purple',
    translationKey: 'categories.main.onlineWork',
    sortOrder: 3,
  },

  // ===== HOME & CONSTRUCTION =====
  {
    id: 'handyman',
    slug: 'handyman',
    icon: Home,
    color: 'blue',
    translationKey: 'categories.main.handyman',
    sortOrder: 4,
  },
  {
    id: 'finishing-work',
    slug: 'finishing-work',
    icon: Wrench,
    color: 'orange',
    translationKey: 'categories.main.finishingWork',
    sortOrder: 5,
  },
  {
    id: 'construction-work',
    slug: 'construction-work',
    icon: Settings,
    color: 'indigo',
    translationKey: 'categories.main.constructionWork',
    sortOrder: 6,
  },
  {
    id: 'furniture-work',
    slug: 'furniture-work',
    icon: Sofa,
    color: 'pink',
    translationKey: 'categories.main.furnitureWork',
    sortOrder: 7,
  },

  // ===== CLEANING & MOVING =====
  {
    id: 'cleaning-services',
    slug: 'cleaning-services',
    icon: Sparkles,
    color: 'purple',
    translationKey: 'categories.main.cleaningServices',
    sortOrder: 8,
  },
  {
    id: 'logistics',
    slug: 'logistics',
    icon: Truck,
    color: 'green',
    translationKey: 'categories.main.logistics',
    sortOrder: 9,
  },

  // ===== PERSONAL SERVICES =====
  {
    id: 'household-services',
    slug: 'household-services',
    icon: Heart,
    color: 'pink',
    translationKey: 'categories.main.householdServices',
    sortOrder: 10,
  },
  {
    id: 'pet-services',
    slug: 'pet-services',
    icon: PawPrint,
    color: 'orange',
    translationKey: 'categories.main.petServices',
    sortOrder: 11,
  },
  {
    id: 'beauty-health',
    slug: 'beauty-health',
    icon: Scissors,
    color: 'pink',
    translationKey: 'categories.main.beautyHealth',
    sortOrder: 12,
  },

  // ===== AUTOMOTIVE =====
  {
    id: 'auto-repair',
    slug: 'auto-repair',
    icon: Car,
    color: 'blue',
    translationKey: 'categories.main.autoRepair',
    sortOrder: 13,
  },

  // ===== DIGITAL & TECH =====
  {
    id: 'digital-marketing',
    slug: 'digital-marketing',
    icon: Megaphone,
    color: 'purple',
    translationKey: 'categories.main.digitalMarketing',
    sortOrder: 14,
  },
  {
    id: 'ai-services',
    slug: 'ai-services',
    icon: CircuitBoard,
    color: 'indigo',
    translationKey: 'categories.main.aiServices',
    sortOrder: 15,
  },
  {
    id: 'online-advertising',
    slug: 'online-advertising',
    icon: MonitorSmartphone,
    color: 'blue',
    translationKey: 'categories.main.onlineAdvertising',
    sortOrder: 16,
  },
  {
    id: 'advertising-distribution',
    slug: 'advertising-distribution',
    icon: Package,
    color: 'orange',
    translationKey: 'categories.main.advertisingDistribution',
    sortOrder: 17,
  },
  {
    id: 'web-development',
    slug: 'web-development',
    icon: Code,
    color: 'blue',
    translationKey: 'categories.main.webDevelopment',
    sortOrder: 18,
  },

  // ===== CREATIVE SERVICES =====
  {
    id: 'design',
    slug: 'design',
    icon: Palette,
    color: 'pink',
    translationKey: 'categories.main.design',
    sortOrder: 19,
  },
  {
    id: 'photo-video',
    slug: 'photo-video',
    icon: Camera,
    color: 'purple',
    translationKey: 'categories.main.photoVideo',
    sortOrder: 20,
  },

  // ===== EDUCATION & PROFESSIONAL =====
  {
    id: 'tutoring',
    slug: 'tutoring',
    icon: GraduationCap,
    color: 'indigo',
    translationKey: 'categories.main.tutoring',
    sortOrder: 21,
  },
  {
    id: 'business-services',
    slug: 'business-services',
    icon: Briefcase,
    color: 'blue',
    translationKey: 'categories.main.businessServices',
    sortOrder: 22,
  },
  {
    id: 'translation-services',
    slug: 'translation-services',
    icon: Languages,
    color: 'green',
    translationKey: 'categories.main.translationServices',
    sortOrder: 23,
  },

  // ===== WELLNESS & EVENTS =====
  {
    id: 'trainer-services',
    slug: 'trainer-services',
    icon: Dumbbell,
    color: 'orange',
    translationKey: 'categories.main.trainerServices',
    sortOrder: 24,
  },
  {
    id: 'event-planning',
    slug: 'event-planning',
    icon: PartyPopper,
    color: 'pink',
    translationKey: 'categories.main.eventPlanning',
    sortOrder: 25,
  },

  // ===== VOLUNTEER =====
  {
    id: 'volunteer-help',
    slug: 'volunteer-help',
    icon: HandHeart,
    color: 'green',
    translationKey: 'categories.main.volunteerHelp',
    sortOrder: 26,
  },
];

/**
 * Get main category by ID
 */
export const getMainCategoryById = (id: string): MainCategory | undefined => {
  return MAIN_CATEGORIES.find(cat => cat.id === id);
};

/**
 * Get main category by slug
 */
export const getMainCategoryBySlug = (slug: string): MainCategory | undefined => {
  return MAIN_CATEGORIES.find(cat => cat.slug === slug);
};

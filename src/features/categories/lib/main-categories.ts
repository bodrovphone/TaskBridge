import {
  Home,
  Wrench,
  Truck,
  Heart,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { MainCategory } from './types';

/**
 * Main Categories - Top-level service categories
 * Based on Kabanchik.ua structure for Bulgarian market
 *
 * Each category has:
 * - Unique ID and slug
 * - Icon from lucide-react
 * - Unique color (used in UI)
 * - Translation key for i18n
 * - Sort order for display
 */
export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: 'home-services',
    slug: 'home-services',
    icon: Home,
    color: 'blue',
    translationKey: 'categories.main.homeServices',
    sortOrder: 1,
  },
  {
    id: 'renovation',
    slug: 'renovation',
    icon: Wrench,
    color: 'orange',
    translationKey: 'categories.main.renovation',
    sortOrder: 2,
  },
  {
    id: 'moving',
    slug: 'moving',
    icon: Truck,
    color: 'green',
    translationKey: 'categories.main.moving',
    sortOrder: 3,
  },
  {
    id: 'cleaning',
    slug: 'cleaning',
    icon: Heart,
    color: 'purple',
    translationKey: 'categories.main.cleaning',
    sortOrder: 4,
  },
  {
    id: 'personal',
    slug: 'personal',
    icon: GraduationCap,
    color: 'indigo',
    translationKey: 'categories.main.personal',
    sortOrder: 5,
  },
  {
    id: 'tech',
    slug: 'tech',
    icon: Briefcase,
    color: 'pink',
    translationKey: 'categories.main.tech',
    sortOrder: 6,
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

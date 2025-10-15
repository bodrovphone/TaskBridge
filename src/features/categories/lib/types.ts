import { LucideIcon } from 'lucide-react';

/**
 * Main category colors - each main category has a unique color
 */
export type CategoryColor = 'blue' | 'orange' | 'green' | 'purple' | 'indigo' | 'pink';

/**
 * Main Category - Top-level category (e.g., "Home Services", "Tech & Digital")
 */
export interface MainCategory {
  id: string;
  slug: string;
  icon: LucideIcon;
  color: CategoryColor;
  translationKey: string; // e.g., 'categories.main.homeServices'
  sortOrder: number;
}

/**
 * Subcategory - Individual service category (e.g., "Plumbing", "Web Development")
 */
export interface Subcategory {
  id: string;
  slug: string;
  mainCategoryId: string;
  translationKey: string; // e.g., 'categories.sub.plumbing'
  sortOrder: number;
}

/**
 * Main Category with translated labels (UI-ready)
 */
export interface MainCategoryWithLabel extends Omit<MainCategory, 'translationKey'> {
  title: string;
  description: string;
}

/**
 * Subcategory with translated label (UI-ready)
 */
export interface SubcategoryWithLabel extends Omit<Subcategory, 'translationKey'> {
  label: string;
}

/**
 * Full main category with subcategories (for Categories page)
 */
export interface MainCategoryWithSubcategories extends MainCategoryWithLabel {
  subcategories: SubcategoryWithLabel[];
  totalCount?: number; // Professional count (optional, from DB later)
}

/**
 * Category option for dropdowns/filters
 */
export interface CategoryOption {
  value: string;
  label: string;
  mainCategoryId?: string;
}

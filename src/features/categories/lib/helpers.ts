import { TFunction } from 'i18next';
import { MAIN_CATEGORIES, getMainCategoryById } from './main-categories';
import { SUBCATEGORIES, getSubcategoriesByMainCategory } from './subcategories';
import {
  MainCategoryWithLabel,
  SubcategoryWithLabel,
  MainCategoryWithSubcategories,
  CategoryOption,
} from './types';

/**
 * Get all main categories with translated labels
 */
export const getMainCategoriesWithLabels = (t: TFunction): MainCategoryWithLabel[] => {
  return MAIN_CATEGORIES.map(cat => ({
    ...cat,
    title: t(`${cat.translationKey}.title`),
    description: t(`${cat.translationKey}.description`),
  })).sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get subcategories with translated labels
 */
export const getSubcategoriesWithLabels = (
  mainCategoryId: string,
  t: TFunction
): SubcategoryWithLabel[] => {
  const subcategories = getSubcategoriesByMainCategory(mainCategoryId);
  return subcategories.map(cat => ({
    ...cat,
    label: t(cat.translationKey),
  }));
};

/**
 * Get all subcategories with translated labels (flat list)
 */
export const getAllSubcategoriesWithLabels = (t: TFunction): SubcategoryWithLabel[] => {
  return SUBCATEGORIES.map(cat => ({
    ...cat,
    label: t(cat.translationKey),
  })).sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get main categories with their subcategories (for Categories page)
 */
export const getMainCategoriesWithSubcategories = (
  t: TFunction
): MainCategoryWithSubcategories[] => {
  const mainCategories = getMainCategoriesWithLabels(t);

  return mainCategories.map(mainCat => ({
    ...mainCat,
    subcategories: getSubcategoriesWithLabels(mainCat.id, t),
    // totalCount will come from DB later, hardcoded for now
    totalCount: getTotalCountForCategory(mainCat.id),
  }));
};

/**
 * Get category options for dropdowns/filters (flat list of subcategories)
 */
export const getCategoryOptions = (t: TFunction): CategoryOption[] => {
  const subcategories = getAllSubcategoriesWithLabels(t);

  return subcategories.map(cat => ({
    value: cat.slug,
    label: cat.label,
    mainCategoryId: cat.mainCategoryId,
  }));
};

/**
 * Get category label by slug (for active filters display)
 * Checks both main categories and subcategories
 */
export const getCategoryLabelBySlug = (slug: string, t: TFunction): string => {
  // First check subcategories
  const subcategory = SUBCATEGORIES.find(cat => cat.slug === slug);
  if (subcategory) {
    return t(subcategory.translationKey);
  }

  // Then check main categories
  const mainCategory = MAIN_CATEGORIES.find(cat => cat.slug === slug);
  if (mainCategory) {
    return t(`${mainCategory.translationKey}.title`);
  }

  // Fallback to slug if not found
  return slug;
};

/**
 * Get main category for a subcategory slug
 */
export const getMainCategoryForSubcategory = (subcategorySlug: string) => {
  const subcategory = SUBCATEGORIES.find(cat => cat.slug === subcategorySlug);
  if (!subcategory) return undefined;

  return getMainCategoryById(subcategory.mainCategoryId);
};

/**
 * Search categories by query string
 */
export const searchCategories = (query: string, t: TFunction): CategoryOption[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const subcategories = getAllSubcategoriesWithLabels(t);

  return subcategories
    .filter(cat =>
      cat.label.toLowerCase().includes(lowerQuery) ||
      cat.slug.toLowerCase().includes(lowerQuery)
    )
    .map(cat => ({
      value: cat.slug,
      label: cat.label,
      mainCategoryId: cat.mainCategoryId,
    }));
};

/**
 * Temporary function to get professional counts (hardcoded)
 * Will be replaced with DB query later
 */
function getTotalCountForCategory(mainCategoryId: string): number {
  const counts: Record<string, number> = {
    'home-services': 450,
    'renovation': 520,
    'moving': 380,
    'cleaning': 290,
    'personal': 220,
    'tech': 195,
  };

  return counts[mainCategoryId] || 0;
}

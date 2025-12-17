import { MAIN_CATEGORIES, getMainCategoryById } from './main-categories';

/**
 * Generic translation function type compatible with both react-i18next and next-intl
 */
type TranslateFunction = (key: string) => string;
import { SUBCATEGORIES, getSubcategoriesByMainCategory } from './subcategories';
import {
  MainCategoryWithLabel,
  SubcategoryWithLabel,
  MainCategoryWithSubcategories,
  CategoryOption,
} from './types';

// Lazy-loaded keywords module
let keywordsModule: typeof import('./category-keywords') | null = null;
let keywordsLoadPromise: Promise<typeof import('./category-keywords')> | null = null;

/**
 * Preload keywords module (call on focus or after 2s delay)
 */
export const preloadCategoryKeywords = (): Promise<void> => {
  if (keywordsModule) return Promise.resolve();
  if (!keywordsLoadPromise) {
    keywordsLoadPromise = import('./category-keywords').then(mod => {
      keywordsModule = mod;
      return mod;
    });
  }
  return keywordsLoadPromise.then(() => {});
};

/**
 * Get keywords module (lazy load if not preloaded)
 */
const getKeywordsModule = async () => {
  if (keywordsModule) return keywordsModule;
  await preloadCategoryKeywords();
  return keywordsModule!;
};

/**
 * Get all main categories with translated labels
 */
export const getMainCategoriesWithLabels = (t: TranslateFunction): MainCategoryWithLabel[] => {
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
  t: TranslateFunction
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
export const getAllSubcategoriesWithLabels = (t: TranslateFunction): SubcategoryWithLabel[] => {
  return SUBCATEGORIES.map(cat => ({
    ...cat,
    label: t(cat.translationKey),
  })).sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get main categories with their subcategories (for Categories page)
 */
export const getMainCategoriesWithSubcategories = (
  t: TranslateFunction
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
export const getCategoryOptions = (t: TranslateFunction): CategoryOption[] => {
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
export const getCategoryLabelBySlug = (slug: string, t: TranslateFunction): string => {
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
 * Search categories by query string (sync version - no keyword matching)
 * Use searchCategoriesAsync for full keyword support
 */
export const searchCategories = (query: string, t: TranslateFunction): CategoryOption[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const subcategories = getAllSubcategoriesWithLabels(t);

  // Score all subcategories (label + slug only, no keywords)
  const scoredResults: { cat: SubcategoryWithLabel; score: number }[] = [];

  for (const cat of subcategories) {
    let score = 0;
    const lowerLabel = cat.label.toLowerCase();

    if (lowerLabel === lowerQuery) {
      score = 100;
    } else if (lowerLabel.startsWith(lowerQuery)) {
      score = 90;
    } else if (lowerLabel.includes(lowerQuery)) {
      score = 70;
    } else if (cat.slug.includes(lowerQuery)) {
      score = 50;
    }

    if (score > 0) {
      scoredResults.push({ cat, score });
    }
  }

  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ cat }) => ({
      value: cat.slug,
      label: cat.label,
      mainCategoryId: cat.mainCategoryId,
    }));
};

/**
 * Search categories by query string (async version with keyword matching)
 * Keywords are lazy-loaded for better initial bundle size
 */
export const searchCategoriesAsync = async (
  query: string,
  t: TranslateFunction,
  language?: string
): Promise<CategoryOption[]> => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const subcategories = getAllSubcategoriesWithLabels(t);

  // Detect language from provided param or default to 'en'
  const lang = (language || 'en') as 'en' | 'bg' | 'ru';

  // Get keyword matches with scores (lazy loaded)
  const keywords = await getKeywordsModule();
  const keywordMatches = keywords.searchKeywords(lowerQuery, lang);
  const keywordMatchMap = new Map(keywordMatches.map(m => [m.slug, m.score]));

  // Score all subcategories
  const scoredResults: { cat: SubcategoryWithLabel; score: number }[] = [];

  for (const cat of subcategories) {
    let score = 0;

    // Check label match (highest priority for exact matches)
    const lowerLabel = cat.label.toLowerCase();
    if (lowerLabel === lowerQuery) {
      score = 100;
    } else if (lowerLabel.startsWith(lowerQuery)) {
      score = Math.max(score, 90);
    } else if (lowerLabel.includes(lowerQuery)) {
      score = Math.max(score, 70);
    }

    // Check slug match
    if (cat.slug.includes(lowerQuery)) {
      score = Math.max(score, 50);
    }

    // Check keyword match
    const keywordScore = keywordMatchMap.get(cat.slug);
    if (keywordScore) {
      score = Math.max(score, keywordScore);
    }

    if (score > 0) {
      scoredResults.push({ cat, score });
    }
  }

  // Sort by score (highest first) and return
  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ cat }) => ({
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

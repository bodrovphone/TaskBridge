import { Subcategory } from './types';

/**
 * Subcategories - Individual service categories
 * Each subcategory belongs to a main category
 *
 * Naming convention:
 * - id: unique identifier (used in code)
 * - slug: URL-friendly version (used in URLs)
 * - translationKey: i18n key for label
 */
export const SUBCATEGORIES: Subcategory[] = [
  // ===== HOME SERVICES =====
  {
    id: 'plumbing',
    slug: 'plumbing',
    mainCategoryId: 'home-services',
    translationKey: 'categories.sub.plumbing',
    sortOrder: 1,
  },
  {
    id: 'electrician',
    slug: 'electrician',
    mainCategoryId: 'home-services',
    translationKey: 'categories.sub.electrician',
    sortOrder: 2,
  },
  {
    id: 'handyman',
    slug: 'handyman',
    mainCategoryId: 'home-services',
    translationKey: 'categories.sub.handyman',
    sortOrder: 3,
  },
  {
    id: 'locksmith',
    slug: 'locksmith',
    mainCategoryId: 'home-services',
    translationKey: 'categories.sub.locksmith',
    sortOrder: 4,
  },
  {
    id: 'carpenter',
    slug: 'carpenter',
    mainCategoryId: 'home-services',
    translationKey: 'categories.sub.carpenter',
    sortOrder: 5,
  },
  {
    id: 'appliance_repair',
    slug: 'appliance-repair',
    mainCategoryId: 'home-services',
    translationKey: 'categories.sub.appliance_repair',
    sortOrder: 6,
  },

  // ===== RENOVATION & CONSTRUCTION =====
  {
    id: 'apartment_renovation',
    slug: 'apartment-renovation',
    mainCategoryId: 'renovation',
    translationKey: 'categories.sub.apartment_renovation',
    sortOrder: 1,
  },
  {
    id: 'tile_installation',
    slug: 'tile-installation',
    mainCategoryId: 'renovation',
    translationKey: 'categories.sub.tile_installation',
    sortOrder: 2,
  },
  {
    id: 'painting',
    slug: 'painting',
    mainCategoryId: 'renovation',
    translationKey: 'categories.sub.painting',
    sortOrder: 3,
  },
  {
    id: 'plastering',
    slug: 'plastering',
    mainCategoryId: 'renovation',
    translationKey: 'categories.sub.plastering',
    sortOrder: 4,
  },
  {
    id: 'bricklaying',
    slug: 'bricklaying',
    mainCategoryId: 'renovation',
    translationKey: 'categories.sub.bricklaying',
    sortOrder: 5,
  },
  {
    id: 'general_labor',
    slug: 'general-labor',
    mainCategoryId: 'renovation',
    translationKey: 'categories.sub.general_labor',
    sortOrder: 6,
  },

  // ===== MOVING & TRANSPORT =====
  {
    id: 'moving_service',
    slug: 'moving-service',
    mainCategoryId: 'moving',
    translationKey: 'categories.sub.moving_service',
    sortOrder: 1,
  },
  {
    id: 'cargo_transport',
    slug: 'cargo-transport',
    mainCategoryId: 'moving',
    translationKey: 'categories.sub.cargo_transport',
    sortOrder: 2,
  },
  {
    id: 'loaders',
    slug: 'loaders',
    mainCategoryId: 'moving',
    translationKey: 'categories.sub.loaders',
    sortOrder: 3,
  },
  {
    id: 'furniture_moving',
    slug: 'furniture-moving',
    mainCategoryId: 'moving',
    translationKey: 'categories.sub.furniture_moving',
    sortOrder: 4,
  },
  {
    id: 'waste_removal',
    slug: 'waste-removal',
    mainCategoryId: 'moving',
    translationKey: 'categories.sub.waste_removal',
    sortOrder: 5,
  },

  // ===== CLEANING SERVICES =====
  {
    id: 'apartment_cleaning',
    slug: 'apartment-cleaning',
    mainCategoryId: 'cleaning',
    translationKey: 'categories.sub.apartment_cleaning',
    sortOrder: 1,
  },
  {
    id: 'deep_cleaning',
    slug: 'deep-cleaning',
    mainCategoryId: 'cleaning',
    translationKey: 'categories.sub.deep_cleaning',
    sortOrder: 2,
  },
  {
    id: 'post_renovation_cleaning',
    slug: 'post-renovation-cleaning',
    mainCategoryId: 'cleaning',
    translationKey: 'categories.sub.post_renovation_cleaning',
    sortOrder: 3,
  },
  {
    id: 'house_cleaning',
    slug: 'house-cleaning',
    mainCategoryId: 'cleaning',
    translationKey: 'categories.sub.house_cleaning',
    sortOrder: 4,
  },
  {
    id: 'office_cleaning',
    slug: 'office-cleaning',
    mainCategoryId: 'cleaning',
    translationKey: 'categories.sub.office_cleaning',
    sortOrder: 5,
  },

  // ===== PERSONAL SERVICES =====
  {
    id: 'babysitting',
    slug: 'babysitting',
    mainCategoryId: 'personal',
    translationKey: 'categories.sub.babysitting',
    sortOrder: 1,
  },
  {
    id: 'caregiver',
    slug: 'caregiver',
    mainCategoryId: 'personal',
    translationKey: 'categories.sub.caregiver',
    sortOrder: 2,
  },
  {
    id: 'housekeeper',
    slug: 'housekeeper',
    mainCategoryId: 'personal',
    translationKey: 'categories.sub.housekeeper',
    sortOrder: 3,
  },
  {
    id: 'tutoring',
    slug: 'tutoring',
    mainCategoryId: 'personal',
    translationKey: 'categories.sub.tutoring',
    sortOrder: 4,
  },
  {
    id: 'pet_care',
    slug: 'pet-care',
    mainCategoryId: 'personal',
    translationKey: 'categories.sub.pet_care',
    sortOrder: 5,
  },

  // ===== TECH & DIGITAL =====
  {
    id: 'computer_repair',
    slug: 'computer-repair',
    mainCategoryId: 'tech',
    translationKey: 'categories.sub.computer_repair',
    sortOrder: 1,
  },
  {
    id: 'phone_repair',
    slug: 'phone-repair',
    mainCategoryId: 'tech',
    translationKey: 'categories.sub.phone_repair',
    sortOrder: 2,
  },
  {
    id: 'it_support',
    slug: 'it-support',
    mainCategoryId: 'tech',
    translationKey: 'categories.sub.it_support',
    sortOrder: 3,
  },
  {
    id: 'web_development',
    slug: 'web-development',
    mainCategoryId: 'tech',
    translationKey: 'categories.sub.web_development',
    sortOrder: 4,
  },
  {
    id: 'digital_marketing',
    slug: 'digital-marketing',
    mainCategoryId: 'tech',
    translationKey: 'categories.sub.digital_marketing',
    sortOrder: 5,
  },
  {
    id: 'seo_services',
    slug: 'seo-services',
    mainCategoryId: 'tech',
    translationKey: 'categories.sub.seo_services',
    sortOrder: 6,
  },
];

/**
 * Get subcategory by ID
 */
export const getSubcategoryById = (id: string): Subcategory | undefined => {
  return SUBCATEGORIES.find(cat => cat.id === id);
};

/**
 * Get subcategory by slug
 */
export const getSubcategoryBySlug = (slug: string): Subcategory | undefined => {
  return SUBCATEGORIES.find(cat => cat.slug === slug);
};

/**
 * Get all subcategories for a main category
 */
export const getSubcategoriesByMainCategory = (mainCategoryId: string): Subcategory[] => {
  return SUBCATEGORIES
    .filter(cat => cat.mainCategoryId === mainCategoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get all subcategories (flat list)
 */
export const getAllSubcategories = (): Subcategory[] => {
  return [...SUBCATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
};

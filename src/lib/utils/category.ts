/**
 * Category utility functions for consistent category handling across the application
 *
 * These utilities handle:
 * - Category color mapping for consistent visual styling
 * - Category name translation with fallbacks
 * - Subcategory to main category mapping
 */

import type { TFunction } from 'i18next'

/**
 * Maps subcategories to their main category for consistent color grouping
 */
const subcategoryToMainCategory: Record<string, string> = {
  // Handyman subcategories
  'plumber': 'handyman',
  'electrician': 'handyman',
  'handyman-service': 'handyman',
  'carpenter': 'handyman',
  'locksmith': 'handyman',
  'painter': 'handyman',
  'furniture-repair': 'handyman',
  'door-window-repair': 'handyman',
  'flooring': 'handyman',
  'roofing': 'handyman',
  'hvac': 'handyman',
  'pest-control': 'handyman',

  // Appliance repair subcategories
  'large-appliance-repair': 'appliance-repair',
  'small-appliance-repair': 'appliance-repair',
  'computer-help': 'appliance-repair',
  'digital-tech-repair': 'appliance-repair',
  'phone-repair': 'appliance-repair',
  'computer-repair': 'appliance-repair',
  'network-setup': 'appliance-repair',

  // Courier services subcategories
  'courier-delivery': 'courier-services',
  'grocery-delivery': 'courier-services',
  'food-delivery': 'courier-services',
  'document-delivery': 'courier-services',
  'express-delivery': 'courier-services',
  'same-day-delivery': 'courier-services',
  'international-shipping': 'courier-services',
  'package-handling': 'courier-services',
  'freight-services': 'courier-services',

  // Logistics subcategories
  'moving': 'logistics',
  'cargo-transport': 'logistics',
  'furniture-assembly': 'logistics',
  'moving-services': 'logistics',
  'packing-services': 'logistics',
  'storage-solutions': 'logistics',
  'vehicle-transport': 'logistics',
  'pet-transport': 'logistics',

  // Cleaning services subcategories
  'house-cleaning': 'cleaning-services',
  'office-cleaning': 'cleaning-services',
  'window-cleaning': 'cleaning-services',
  'carpet-cleaning': 'cleaning-services',
  'deep-cleaning': 'cleaning-services',
  'move-in-out-cleaning': 'cleaning-services',
  'upholstery-cleaning': 'cleaning-services',
  'laundry-ironing': 'cleaning-services',
  'organizing': 'cleaning-services',

  // Pet services subcategories
  'dog-walking': 'pet-services',
  'pet-sitting': 'pet-services',
  'pet-grooming': 'pet-services',

  // Beauty & health subcategories
  'massage': 'beauty-health',
  'hairdresser': 'beauty-health',
  'manicure': 'beauty-health',
  'makeup': 'beauty-health',
  'haircut': 'beauty-health',
  'manicure-pedicure': 'beauty-health',
  'makeup-artist': 'beauty-health',
  'spa-treatments': 'beauty-health',

  // Tutoring subcategories
  'language-tutoring': 'tutoring',
  'math-tutoring': 'tutoring',
  'music-lessons': 'tutoring',
  'english-tutor': 'tutoring',
  'math-tutor': 'tutoring',
  'language-tutor': 'tutoring',
  'art-lessons': 'tutoring',
  'fitness-training': 'tutoring',
  'yoga-instructor': 'tutoring',
  'dance-instructor': 'tutoring',
  'cooking-classes': 'tutoring',

  // Personal services subcategories
  'grocery-shopping': 'personal-assistant',
  'errands': 'personal-assistant',
  'personal-shopping': 'personal-assistant',
  'event-help': 'personal-assistant',
  'queue-waiting': 'personal-assistant',
  'babysitting': 'personal-assistant',
  'elderly-care': 'personal-assistant',

  // Professional services subcategories
  'legal-consulting': 'consulting',
  'tax-consulting': 'consulting',
  'business-consulting': 'consulting',
  'financial-planning': 'consulting',
  'real-estate-consulting': 'consulting',
  'accounting': 'consulting',
  'notary-services': 'consulting',

  // Digital services subcategories
  'software-installation': 'web-development',
  'data-recovery': 'web-development',
  'smart-home-setup': 'web-development',
  'website-development': 'web-development',
  'graphic-design': 'design',
  'video-editing': 'photo-video',
  'social-media-management': 'digital-marketing',

  // Outdoor & landscaping subcategories
  'lawn-mowing': 'gardening',
  'tree-trimming': 'gardening',
  'landscaping': 'gardening',
  'snow-removal': 'gardening',
  'gutter-cleaning': 'gardening',
  'pressure-washing': 'gardening',

  // Events & entertainment subcategories
  'photography': 'photo-video',
  'videography': 'photo-video',
  'dj-services': 'event-planning',
  'catering': 'event-planning',
  'party-planning': 'event-planning',
  'decoration': 'event-planning',
  'entertainment': 'event-planning',

  // Automotive subcategories
  'car-wash': 'auto-repair',
  'car-repair': 'auto-repair',
  'tire-service': 'auto-repair',
  'car-detailing': 'auto-repair',
  'towing': 'auto-repair',
}

/**
 * Main category color mappings using Tailwind CSS classes
 * Colors are grouped by service type for visual consistency
 */
const mainCategoryColors: Record<string, string> = {
  // Home & Repair Services (Blue)
  'handyman': 'bg-blue-100 text-blue-800 border-blue-200',
  'appliance-repair': 'bg-blue-100 text-blue-800 border-blue-200',
  'finishing-work': 'bg-blue-100 text-blue-800 border-blue-200',
  'furniture-work': 'bg-blue-100 text-blue-800 border-blue-200',
  'construction-work': 'bg-blue-100 text-blue-800 border-blue-200',
  'auto-repair': 'bg-blue-100 text-blue-800 border-blue-200',
  'home_repair': 'bg-blue-100 text-blue-800 border-blue-200', // Legacy
  'plumbing': 'bg-blue-100 text-blue-800 border-blue-200',
  'electrical': 'bg-blue-100 text-blue-800 border-blue-200',

  // Delivery & Logistics (Green)
  'courier-services': 'bg-green-100 text-green-800 border-green-200',
  'logistics': 'bg-green-100 text-green-800 border-green-200',
  'delivery_transport': 'bg-green-100 text-green-800 border-green-200', // Legacy

  // Personal Services (Purple)
  'pet-services': 'bg-purple-100 text-purple-800 border-purple-200',
  'beauty-health': 'bg-purple-100 text-purple-800 border-purple-200',
  'cleaning-services': 'bg-purple-100 text-purple-800 border-purple-200',
  'household-services': 'bg-purple-100 text-purple-800 border-purple-200',
  'personal_care': 'bg-purple-100 text-purple-800 border-purple-200', // Legacy
  'house-cleaning': 'bg-purple-100 text-purple-800 border-purple-200',

  // Professional Services (Orange)
  'business-services': 'bg-orange-100 text-orange-800 border-orange-200',
  'event-planning': 'bg-orange-100 text-orange-800 border-orange-200',
  'advertising-distribution': 'bg-orange-100 text-orange-800 border-orange-200',
  'personal_assistant': 'bg-orange-100 text-orange-800 border-orange-200', // Legacy
  'personal-assistant': 'bg-orange-100 text-orange-800 border-orange-200',
  'pet-care': 'bg-orange-100 text-orange-800 border-orange-200',
  'childcare': 'bg-orange-100 text-orange-800 border-orange-200',

  // Learning & Creative (Pink)
  'tutoring': 'bg-pink-100 text-pink-800 border-pink-200',
  'trainer-services': 'bg-pink-100 text-pink-800 border-pink-200',
  'photo-video': 'bg-pink-100 text-pink-800 border-pink-200',
  'design': 'bg-pink-100 text-pink-800 border-pink-200',
  'learning_fitness': 'bg-pink-100 text-pink-800 border-pink-200', // Legacy
  'teaching': 'bg-pink-100 text-pink-800 border-pink-200',
  'fitness': 'bg-pink-100 text-pink-800 border-pink-200',

  // Digital Services (Indigo/Cyan)
  'web-development': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'digital-marketing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'online-advertising': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'online-work': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'ai-services': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'tech-support': 'bg-cyan-100 text-cyan-800 border-cyan-200',

  // Translation Services (Teal)
  'translation-services': 'bg-teal-100 text-teal-800 border-teal-200',

  // Consulting (Indigo)
  'consulting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'legal': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'financial': 'bg-indigo-100 text-indigo-800 border-indigo-200',

  // Beauty & Wellness (Rose)
  'beauty-services': 'bg-rose-100 text-rose-800 border-rose-200',
  'wellness': 'bg-rose-100 text-rose-800 border-rose-200',

  // Outdoor & Landscaping (Lime)
  'gardening': 'bg-lime-100 text-lime-800 border-lime-200',

  // Events & Entertainment (Fuchsia)
  'photography': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',

  // Automotive (Slate)
  'automotive': 'bg-slate-100 text-slate-800 border-slate-200',

  // Volunteer (Emerald)
  'volunteer-help': 'bg-emerald-100 text-emerald-800 border-emerald-200',

  // Other/Default (Gray)
  'other': 'bg-gray-100 text-gray-800 border-gray-200',
}

/**
 * Get the Tailwind CSS color classes for a category
 * Maps subcategories to main categories and returns consistent color styling
 *
 * @param category - The category or subcategory slug (e.g., "plumber", "handyman")
 * @returns Tailwind CSS classes for background, text, and border colors
 *
 * @example
 * getCategoryColor('plumber') // Returns blue classes (mapped to 'handyman')
 * getCategoryColor('courier-services') // Returns green classes
 */
export function getCategoryColor(category: string): string {
  const mainCategory = subcategoryToMainCategory[category] || category
  return mainCategoryColors[mainCategory] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get the translated display name for a category
 * Handles both categories and subcategories with fallback formatting
 *
 * @param t - Translation function from i18next
 * @param category - The main category slug
 * @param subcategory - Optional subcategory slug
 * @returns Translated category name or formatted fallback
 *
 * @example
 * getCategoryName(t, 'handyman') // Returns translated name or "Handyman"
 * getCategoryName(t, 'handyman', 'plumber') // Returns translated name or "Plumber"
 */
export function getCategoryName(
  t: TFunction,
  category: string,
  subcategory?: string | null
): string {
  // If subcategory exists, use it for display
  if (subcategory) {
    // Convert kebab-case to camelCase for translation key (e.g., "martial-arts" → "martialArts")
    const camelCase = subcategory.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    const subcategoryKey = `categories.sub.${camelCase}`
    const translated = t(subcategoryKey, '')

    // If translation exists, use it
    if (translated) return translated

    // Try taskCard category translation as fallback
    const taskCardKey = `taskCard.category.${subcategory}`
    const taskCardTranslation = t(taskCardKey, '')
    if (taskCardTranslation) return taskCardTranslation

    // Format subcategory as final fallback (e.g., "courier-delivery" → "Courier Delivery")
    return subcategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Fall back to main category
  const categoryKey = `taskCard.category.${category}`
  const categoryTranslation = t(categoryKey, '')
  if (categoryTranslation) return categoryTranslation

  // Final fallback: format category name
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get a fallback image URL for a category
 * Returns category-specific images from Unsplash for visual consistency
 *
 * @param category - The category slug
 * @param taskId - Optional task ID for specific mock task images
 * @returns Unsplash image URL optimized for task cards
 *
 * @example
 * getCategoryImage('handyman') // Returns repair/tools image
 * getCategoryImage('courier-services') // Returns delivery image
 */
export function getCategoryImage(category: string, taskId?: string): string {
  // Specific images for mock tasks based on task ID and content
  if (taskId === '1') {
    // Dog walking task
    return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center'
  }
  if (taskId === '2') {
    // Balcony repair task
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&crop=center'
  }
  if (taskId === '3') {
    // Apartment cleaning task
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'
  }

  // Category-based fallback images
  const imageMap: Record<string, string> = {
    // Home & Repair
    'home_repair': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=300&fit=crop&crop=center',
    'handyman': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=300&fit=crop&crop=center',
    'plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop&crop=center',
    'electrical': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop&crop=center',
    'appliance-repair': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&crop=center',

    // Delivery & Logistics
    'delivery_transport': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&crop=center',
    'courier-services': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&crop=center',
    'logistics': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop&crop=center',
    'furniture-assembly': 'https://images.unsplash.com/photo-1581858726788-75bc0f1a4eac?w=400&h=300&fit=crop&crop=center',

    // Cleaning
    'personal_care': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
    'cleaning-services': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
    'house-cleaning': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',

    // Personal Services
    'personal_assistant': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop&crop=center',
    'personal-assistant': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop&crop=center',
    'pet-services': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center',
    'pet-care': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center',

    // Learning & Fitness
    'learning_fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    'tutoring': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&crop=center',
    'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',

    // Digital Services
    'web-development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop&crop=center',
    'digital-marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center',
    'tech-support': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&crop=center',

    // Events & Creative
    'photo-video': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop&crop=center',
    'photography': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop&crop=center',
    'event-planning': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&crop=center',

    // Default
    'other': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center',
  }

  return imageMap[category] || imageMap.other
}

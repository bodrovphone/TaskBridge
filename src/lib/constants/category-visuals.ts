/**
 * Category Visual Mapping
 * Maps task categories to gradient colors and icons for default task images
 */

import {
  Wrench,
  Settings,
  Sparkles,
  Package,
  Truck,
  Car,
  Dog,
  Briefcase,
  BookOpen,
  Code,
  FileText,
  Zap,
  Hammer,
  Home,
  Lightbulb,
  Paintbrush,
  Sofa,
  ShoppingBag,
  UtensilsCrossed,
  FileText as DocumentIcon,
  PawPrint,
  Heart,
  Scissors,
  Dumbbell,
  Camera,
  Palette,
  Monitor,
  Megaphone,
  Globe,
  Languages,
  HandHeart,
  Calendar
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface CategoryVisual {
  gradient: string  // Tailwind gradient classes (e.g., 'from-blue-500 to-blue-600')
  icon: LucideIcon
}

export const categoryVisuals: Record<string, CategoryVisual> = {
  // ============================================
  // HOME & REPAIR SERVICES (Blue Tones)
  // ============================================

  'handyman': {
    gradient: 'from-blue-500 to-blue-700',
    icon: Wrench,
  },
  'plumber': {
    gradient: 'from-blue-500 to-blue-700',
    icon: Wrench,
  },
  'electrician': {
    gradient: 'from-blue-500 to-blue-700',
    icon: Lightbulb,
  },
  'handyman-service': {
    gradient: 'from-blue-500 to-blue-700',
    icon: Hammer,
  },

  'appliance-repair': {
    gradient: 'from-blue-400 to-blue-600',
    icon: Settings,
  },
  'large-appliance-repair': {
    gradient: 'from-blue-400 to-blue-600',
    icon: Zap,
  },
  'small-appliance-repair': {
    gradient: 'from-blue-400 to-blue-600',
    icon: Settings,
  },

  'finishing-work': {
    gradient: 'from-blue-600 to-blue-800',
    icon: Paintbrush,
  },
  'furniture-work': {
    gradient: 'from-blue-500 to-blue-700',
    icon: Sofa,
  },
  'construction-work': {
    gradient: 'from-blue-700 to-blue-900',
    icon: Home,
  },
  'auto-repair': {
    gradient: 'from-blue-600 to-blue-800',
    icon: Car,
  },

  // ============================================
  // DELIVERY & LOGISTICS (Green Tones)
  // ============================================

  'courier-services': {
    gradient: 'from-green-500 to-green-700',
    icon: Package,
  },
  'courier-delivery': {
    gradient: 'from-green-500 to-green-700',
    icon: Package,
  },
  'grocery-delivery': {
    gradient: 'from-green-400 to-green-600',
    icon: ShoppingBag,
  },
  'food-delivery': {
    gradient: 'from-green-400 to-green-600',
    icon: UtensilsCrossed,
  },
  'document-delivery': {
    gradient: 'from-green-500 to-green-700',
    icon: DocumentIcon,
  },

  'logistics': {
    gradient: 'from-green-600 to-green-800',
    icon: Truck,
  },
  'moving': {
    gradient: 'from-green-600 to-green-800',
    icon: Truck,
  },
  'cargo-transport': {
    gradient: 'from-green-600 to-green-800',
    icon: Truck,
  },
  'furniture-assembly': {
    gradient: 'from-green-500 to-green-700',
    icon: Sofa,
  },

  // ============================================
  // PERSONAL SERVICES (Purple Tones)
  // ============================================

  'pet-services': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Dog,
  },
  'dog-walking': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Dog,
  },
  'pet-sitting': {
    gradient: 'from-purple-400 to-purple-600',
    icon: PawPrint,
  },
  'pet-grooming': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Scissors,
  },

  'beauty-health': {
    gradient: 'from-purple-600 to-purple-800',
    icon: Heart,
  },
  'massage': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Heart,
  },
  'hairdresser': {
    gradient: 'from-purple-600 to-purple-800',
    icon: Scissors,
  },
  'manicure': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Sparkles,
  },
  'makeup': {
    gradient: 'from-purple-600 to-purple-800',
    icon: Sparkles,
  },

  'cleaning-services': {
    gradient: 'from-purple-400 to-purple-600',
    icon: Sparkles,
  },
  'house-cleaning': {
    gradient: 'from-purple-400 to-purple-600',
    icon: Sparkles,
  },
  'office-cleaning': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Sparkles,
  },
  'window-cleaning': {
    gradient: 'from-purple-400 to-purple-600',
    icon: Sparkles,
  },
  'carpet-cleaning': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Sparkles,
  },

  'household-services': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Home,
  },

  // ============================================
  // PROFESSIONAL SERVICES (Orange Tones)
  // ============================================

  'business-services': {
    gradient: 'from-orange-500 to-orange-700',
    icon: Briefcase,
  },
  'event-planning': {
    gradient: 'from-orange-600 to-orange-800',
    icon: Calendar,
  },
  'advertising-distribution': {
    gradient: 'from-orange-500 to-orange-700',
    icon: Megaphone,
  },

  // ============================================
  // LEARNING & CREATIVE (Pink Tones)
  // ============================================

  'tutoring': {
    gradient: 'from-pink-500 to-pink-700',
    icon: BookOpen,
  },
  'language-tutoring': {
    gradient: 'from-pink-500 to-pink-700',
    icon: BookOpen,
  },
  'math-tutoring': {
    gradient: 'from-pink-600 to-pink-800',
    icon: BookOpen,
  },
  'music-lessons': {
    gradient: 'from-pink-500 to-pink-700',
    icon: Heart,
  },

  'trainer-services': {
    gradient: 'from-pink-600 to-pink-800',
    icon: Dumbbell,
  },
  'photo-video': {
    gradient: 'from-pink-500 to-pink-700',
    icon: Camera,
  },
  'design': {
    gradient: 'from-pink-600 to-pink-800',
    icon: Palette,
  },

  // ============================================
  // DIGITAL SERVICES (Indigo Tones)
  // ============================================

  'web-development': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Code,
  },
  'digital-marketing': {
    gradient: 'from-indigo-600 to-indigo-800',
    icon: Megaphone,
  },
  'online-advertising': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Monitor,
  },
  'online-work': {
    gradient: 'from-indigo-600 to-indigo-800',
    icon: Monitor,
  },
  'ai-services': {
    gradient: 'from-indigo-700 to-indigo-900',
    icon: Sparkles,
  },
  'computer-help': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Monitor,
  },
  'digital-tech-repair': {
    gradient: 'from-indigo-600 to-indigo-800',
    icon: Settings,
  },
  'phone-repair': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Settings,
  },

  // ============================================
  // TRANSLATION SERVICES (Teal Tones)
  // ============================================

  'translation-services': {
    gradient: 'from-teal-500 to-teal-700',
    icon: Languages,
  },

  // ============================================
  // VOLUNTEER (Emerald Tones)
  // ============================================

  'volunteer-help': {
    gradient: 'from-emerald-500 to-emerald-700',
    icon: HandHeart,
  },

  // ============================================
  // LEGACY & FALLBACK
  // ============================================

  // Legacy categories (backward compatibility)
  'home_repair': {
    gradient: 'from-blue-500 to-blue-700',
    icon: Wrench,
  },
  'delivery_transport': {
    gradient: 'from-green-500 to-green-700',
    icon: Package,
  },
  'personal_care': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Heart,
  },
  'personal_assistant': {
    gradient: 'from-orange-500 to-orange-700',
    icon: Briefcase,
  },
  'learning_fitness': {
    gradient: 'from-pink-500 to-pink-700',
    icon: BookOpen,
  },

  // Default fallback for unmapped categories
  'other': {
    gradient: 'from-gray-500 to-gray-600',
    icon: FileText,
  },
}

/**
 * Get visual configuration for a category
 * Falls back to 'other' if category not found
 */
export function getCategoryVisual(category: string): CategoryVisual {
  return categoryVisuals[category] || categoryVisuals.other
}

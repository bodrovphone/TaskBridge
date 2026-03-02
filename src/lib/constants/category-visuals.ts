/**
 * Category Visual Mapping
 * Maps task categories to gradient colors and icons for default task images
 *
 * Each subcategory should have a UNIQUE icon to avoid visual repetition
 * on pages that list multiple tasks without photos.
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
  PawPrint,
  Heart,
  Scissors,
  Dumbbell,
  Camera,
  Palette,
  Monitor,
  Megaphone,
  Languages,
  HandHeart,
  Calendar,
  Droplets,
  Cog,
  Smartphone,
  Cpu,
  Globe,
  Laptop,
  GraduationCap,
  Calculator,
  PackageOpen,
  Bike,
  Gem,
  Music,
  SprayCan,
  Building2,
  Wind,
  Waves,
  Armchair,
  Bot,
  Hand,
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
    icon: Droplets,
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
    icon: Cog,
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
    icon: Bike,
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
    icon: FileText,
  },

  'logistics': {
    gradient: 'from-green-600 to-green-800',
    icon: Truck,
  },
  'moving': {
    gradient: 'from-green-600 to-green-800',
    icon: PackageOpen,
  },
  'cargo-transport': {
    gradient: 'from-green-600 to-green-800',
    icon: Truck,
  },
  'furniture-assembly': {
    gradient: 'from-green-500 to-green-700',
    icon: Hammer,
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
    icon: PawPrint,
  },
  'pet-sitting': {
    gradient: 'from-purple-400 to-purple-600',
    icon: Dog,
  },
  'pet-grooming': {
    gradient: 'from-purple-500 to-purple-700',
    icon: SprayCan,
  },

  'beauty-health': {
    gradient: 'from-purple-600 to-purple-800',
    icon: Heart,
  },
  'massage': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Hand,
  },
  'hairdresser': {
    gradient: 'from-purple-600 to-purple-800',
    icon: Scissors,
  },
  'manicure': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Gem,
  },
  'makeup': {
    gradient: 'from-purple-600 to-purple-800',
    icon: Palette,
  },

  'cleaning-services': {
    gradient: 'from-purple-400 to-purple-600',
    icon: Sparkles,
  },
  'house-cleaning': {
    gradient: 'from-purple-400 to-purple-600',
    icon: SprayCan,
  },
  'office-cleaning': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Building2,
  },
  'window-cleaning': {
    gradient: 'from-purple-400 to-purple-600',
    icon: Wind,
  },
  'carpet-cleaning': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Waves,
  },

  'household-services': {
    gradient: 'from-purple-500 to-purple-700',
    icon: Armchair,
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
    icon: GraduationCap,
  },
  'math-tutoring': {
    gradient: 'from-pink-600 to-pink-800',
    icon: Calculator,
  },
  'music-lessons': {
    gradient: 'from-pink-500 to-pink-700',
    icon: Music,
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
    icon: Globe,
  },
  'online-work': {
    gradient: 'from-indigo-600 to-indigo-800',
    icon: Monitor,
  },
  'ai-services': {
    gradient: 'from-indigo-700 to-indigo-900',
    icon: Bot,
  },
  'computer-help': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Laptop,
  },
  'digital-tech-repair': {
    gradient: 'from-indigo-600 to-indigo-800',
    icon: Cpu,
  },
  'phone-repair': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Smartphone,
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

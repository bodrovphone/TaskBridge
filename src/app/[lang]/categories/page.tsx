'use client'

import { useTranslation } from 'react-i18next'
import MainCategoryCard from "@/components/ui/main-category-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {
  Home,
  Truck,
  Heart,
  Briefcase,
  GraduationCap,
  Wrench
} from "lucide-react"

function CategoriesPage() {
  const { t } = useTranslation()

  // Main categories with subcategories (based on Kabanchik.ua structure)
  // All 6 categories have UNIQUE colors: blue, orange, green, purple, indigo, pink
  const mainCategories = [
    {
      title: t('categories.main.homeServices.title', 'Home Services'),
      description: t('categories.main.homeServices.description', 'Professional repair and maintenance'),
      icon: Home,
      color: "blue",
      totalCount: 450,
      subcategories: [
        { label: t('categories.sub.plumbing', 'Plumbing'), value: 'plumbing' },
        { label: t('categories.sub.electrician', 'Electrician'), value: 'electrician' },
        { label: t('categories.sub.handyman', 'Handyman'), value: 'handyman' },
        { label: t('categories.sub.locksmith', 'Locksmith'), value: 'locksmith' },
        { label: t('categories.sub.carpenter', 'Carpenter'), value: 'carpenter' },
        { label: t('categories.sub.appliance_repair', 'Appliance Repair'), value: 'appliance_repair' },
      ]
    },
    {
      title: t('categories.main.renovation.title', 'Renovation & Construction'),
      description: t('categories.main.renovation.description', 'Building and finishing work'),
      icon: Wrench,
      color: "orange",
      totalCount: 520,
      subcategories: [
        { label: t('categories.sub.apartment_renovation', 'Apartment Renovation'), value: 'apartment_renovation' },
        { label: t('categories.sub.tile_installation', 'Tile Installation'), value: 'tile_installation' },
        { label: t('categories.sub.painting', 'Painting'), value: 'painting' },
        { label: t('categories.sub.plastering', 'Plastering'), value: 'plastering' },
        { label: t('categories.sub.bricklaying', 'Bricklaying'), value: 'bricklaying' },
        { label: t('categories.sub.general_labor', 'General Labor'), value: 'general_labor' },
      ]
    },
    {
      title: t('categories.main.moving.title', 'Moving & Transport'),
      description: t('categories.main.moving.description', 'Relocation and cargo services'),
      icon: Truck,
      color: "green",
      totalCount: 380,
      subcategories: [
        { label: t('categories.sub.moving_service', 'Moving Service'), value: 'moving_service' },
        { label: t('categories.sub.cargo_transport', 'Cargo Transport'), value: 'cargo_transport' },
        { label: t('categories.sub.loaders', 'Loaders'), value: 'loaders' },
        { label: t('categories.sub.furniture_moving', 'Furniture Moving'), value: 'furniture_moving' },
        { label: t('categories.sub.waste_removal', 'Waste Removal'), value: 'waste_removal' },
      ]
    },
    {
      title: t('categories.main.cleaning.title', 'Cleaning Services'),
      description: t('categories.main.cleaning.description', 'Professional cleaning solutions'),
      icon: Heart,
      color: "purple",
      totalCount: 290,
      subcategories: [
        { label: t('categories.sub.apartment_cleaning', 'Apartment Cleaning'), value: 'apartment_cleaning' },
        { label: t('categories.sub.deep_cleaning', 'Deep Cleaning'), value: 'deep_cleaning' },
        { label: t('categories.sub.post_renovation_cleaning', 'Post-Renovation Cleaning'), value: 'post_renovation_cleaning' },
        { label: t('categories.sub.house_cleaning', 'House Cleaning'), value: 'house_cleaning' },
        { label: t('categories.sub.office_cleaning', 'Office Cleaning'), value: 'office_cleaning' },
      ]
    },
    {
      title: t('categories.main.personal.title', 'Personal Services'),
      description: t('categories.main.personal.description', 'Care and personal assistance'),
      icon: GraduationCap,
      color: "indigo",
      totalCount: 220,
      subcategories: [
        { label: t('categories.sub.babysitting', 'Babysitting'), value: 'babysitting' },
        { label: t('categories.sub.caregiver', 'Caregiver'), value: 'caregiver' },
        { label: t('categories.sub.housekeeper', 'Housekeeper'), value: 'housekeeper' },
        { label: t('categories.sub.tutoring', 'Tutoring'), value: 'tutoring' },
        { label: t('categories.sub.pet_care', 'Pet Care'), value: 'pet_care' },
      ]
    },
    {
      title: t('categories.main.tech.title', 'Tech & Digital'),
      description: t('categories.main.tech.description', 'Technology and digital services'),
      icon: Briefcase,
      color: "pink",
      totalCount: 195,
      subcategories: [
        { label: t('categories.sub.computer_repair', 'Computer Repair'), value: 'computer_repair' },
        { label: t('categories.sub.phone_repair', 'Phone Repair'), value: 'phone_repair' },
        { label: t('categories.sub.it_support', 'IT Support'), value: 'it_support' },
        { label: t('categories.sub.web_development', 'Web Development'), value: 'web_development' },
        { label: t('categories.sub.digital_marketing', 'Digital Marketing'), value: 'digital_marketing' },
        { label: t('categories.sub.seo_services', 'SEO Services'), value: 'seo_services' },
      ]
    },
  ]

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px]"></div>

      {/* Content */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              {t('categories.pageTitle', 'Browse All Categories')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('categories.pageSubtitle', 'Find the perfect professional for any task')}
            </p>
          </div>

          {/* Main Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mainCategories.map((category) => (
              <MainCategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
                subcategories={category.subcategories}
                totalCount={category.totalCount}
              />
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('categories.ctaTitle', "Can't find what you're looking for?")}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {t('categories.ctaSubtitle', 'Post your task and let professionals come to you')}
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold"
            >
              {t('nav.createTask', 'Create Task')} <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

CategoriesPage.displayName = 'CategoriesPage'

export default CategoriesPage

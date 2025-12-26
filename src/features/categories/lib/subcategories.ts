import { Subcategory } from './types';

/**
 * Subcategories - Individual service categories (100+ total)
 * Expanded from ~31 to 135 subcategories based on Ukrainian platform data
 *
 * Each subcategory belongs to a main category and includes:
 * - Unique ID (kebab-case)
 * - URL-friendly slug
 * - Parent main category ID
 * - Translation key for i18n
 * - Sort order within parent category
 *
 * Organized by main category for maintainability
 */
export const SUBCATEGORIES: Subcategory[] = [
  // ===== HANDYMAN (Домашний мастер) =====
  {
    id: 'plumber',
    slug: 'plumber',
    mainCategoryId: 'handyman',
    translationKey: 'categories.sub.plumber',
    sortOrder: 1,
  },
  {
    id: 'electrician',
    slug: 'electrician',
    mainCategoryId: 'handyman',
    translationKey: 'categories.sub.electrician',
    sortOrder: 2,
  },
  {
    id: 'handyman-service',
    slug: 'handyman-service',
    mainCategoryId: 'handyman',
    translationKey: 'categories.sub.handymanService',
    sortOrder: 3,
  },
  {
    id: 'carpenter',
    slug: 'carpenter',
    mainCategoryId: 'handyman',
    translationKey: 'categories.sub.carpenter',
    sortOrder: 4,
  },
  {
    id: 'locksmith',
    slug: 'locksmith',
    mainCategoryId: 'handyman',
    translationKey: 'categories.sub.locksmith',
    sortOrder: 5,
  },

  // ===== APPLIANCE REPAIR (Ремонт техники) =====
  {
    id: 'large-appliance-repair',
    slug: 'large-appliance-repair',
    mainCategoryId: 'appliance-repair',
    translationKey: 'categories.sub.largeApplianceRepair',
    sortOrder: 1,
  },
  {
    id: 'small-appliance-repair',
    slug: 'small-appliance-repair',
    mainCategoryId: 'appliance-repair',
    translationKey: 'categories.sub.smallApplianceRepair',
    sortOrder: 2,
  },
  {
    id: 'computer-help',
    slug: 'computer-help',
    mainCategoryId: 'appliance-repair',
    translationKey: 'categories.sub.computerHelp',
    sortOrder: 3,
  },
  {
    id: 'digital-tech-repair',
    slug: 'digital-tech-repair',
    mainCategoryId: 'appliance-repair',
    translationKey: 'categories.sub.digitalTechRepair',
    sortOrder: 4,
  },
  {
    id: 'phone-repair',
    slug: 'phone-repair',
    mainCategoryId: 'appliance-repair',
    translationKey: 'categories.sub.phoneRepair',
    sortOrder: 5,
  },
  {
    id: 'ac-maintenance',
    slug: 'ac-maintenance',
    mainCategoryId: 'appliance-repair',
    translationKey: 'categories.sub.acMaintenance',
    sortOrder: 6,
  },

  // ===== FINISHING WORK (Отделочные работы) =====
  {
    id: 'apartment-renovation',
    slug: 'apartment-renovation',
    mainCategoryId: 'finishing-work',
    translationKey: 'categories.sub.apartmentRenovation',
    sortOrder: 1,
  },
  {
    id: 'tile-installation',
    slug: 'tile-installation',
    mainCategoryId: 'finishing-work',
    translationKey: 'categories.sub.tileInstallation',
    sortOrder: 2,
  },
  {
    id: 'plastering',
    slug: 'plastering',
    mainCategoryId: 'finishing-work',
    translationKey: 'categories.sub.plastering',
    sortOrder: 3,
  },
  {
    id: 'insulation',
    slug: 'insulation',
    mainCategoryId: 'finishing-work',
    translationKey: 'categories.sub.insulation',
    sortOrder: 4,
  },
  {
    id: 'heating-installation',
    slug: 'heating-installation',
    mainCategoryId: 'finishing-work',
    translationKey: 'categories.sub.heatingInstallation',
    sortOrder: 5,
  },

  // ===== CONSTRUCTION WORK (Строительные работы) =====
  {
    id: 'general-labor',
    slug: 'general-labor',
    mainCategoryId: 'construction-work',
    translationKey: 'categories.sub.generalLabor',
    sortOrder: 1,
  },
  {
    id: 'welding',
    slug: 'welding',
    mainCategoryId: 'construction-work',
    translationKey: 'categories.sub.welding',
    sortOrder: 2,
  },
  {
    id: 'turning',
    slug: 'turning',
    mainCategoryId: 'construction-work',
    translationKey: 'categories.sub.turning',
    sortOrder: 3,
  },
  {
    id: 'carpentry',
    slug: 'carpentry',
    mainCategoryId: 'construction-work',
    translationKey: 'categories.sub.carpentry',
    sortOrder: 4,
  },
  {
    id: 'bricklaying',
    slug: 'bricklaying',
    mainCategoryId: 'construction-work',
    translationKey: 'categories.sub.bricklaying',
    sortOrder: 5,
  },

  // ===== FURNITURE WORK (Мебельные работы) =====
  {
    id: 'furniture-manufacturing',
    slug: 'furniture-manufacturing',
    mainCategoryId: 'furniture-work',
    translationKey: 'categories.sub.furnitureManufacturing',
    sortOrder: 1,
  },
  {
    id: 'furniture-repair',
    slug: 'furniture-repair',
    mainCategoryId: 'furniture-work',
    translationKey: 'categories.sub.furnitureRepair',
    sortOrder: 2,
  },
  {
    id: 'furniture-assembly',
    slug: 'furniture-assembly',
    mainCategoryId: 'furniture-work',
    translationKey: 'categories.sub.furnitureAssembly',
    sortOrder: 3,
  },
  {
    id: 'furniture-restoration',
    slug: 'furniture-restoration',
    mainCategoryId: 'furniture-work',
    translationKey: 'categories.sub.furnitureRestoration',
    sortOrder: 4,
  },
  {
    id: 'furniture-upholstery',
    slug: 'furniture-upholstery',
    mainCategoryId: 'furniture-work',
    translationKey: 'categories.sub.furnitureUpholstery',
    sortOrder: 5,
  },

  // ===== CLEANING SERVICES (Клининговые услуги) =====
  {
    id: 'apartment-cleaning',
    slug: 'apartment-cleaning',
    mainCategoryId: 'cleaning-services',
    translationKey: 'categories.sub.apartmentCleaning',
    sortOrder: 1,
  },
  {
    id: 'deep-cleaning',
    slug: 'deep-cleaning',
    mainCategoryId: 'cleaning-services',
    translationKey: 'categories.sub.deepCleaning',
    sortOrder: 2,
  },
  {
    id: 'post-renovation-cleaning',
    slug: 'post-renovation-cleaning',
    mainCategoryId: 'cleaning-services',
    translationKey: 'categories.sub.postRenovationCleaning',
    sortOrder: 3,
  },
  {
    id: 'dry-cleaning',
    slug: 'dry-cleaning',
    mainCategoryId: 'cleaning-services',
    translationKey: 'categories.sub.dryCleaning',
    sortOrder: 4,
  },
  {
    id: 'house-cleaning',
    slug: 'house-cleaning',
    mainCategoryId: 'cleaning-services',
    translationKey: 'categories.sub.houseCleaning',
    sortOrder: 5,
  },

  // ===== LOGISTICS (Логистические и складские услуги) =====
  {
    id: 'cargo-transport',
    slug: 'cargo-transport',
    mainCategoryId: 'logistics',
    translationKey: 'categories.sub.cargoTransport',
    sortOrder: 1,
  },
  {
    id: 'loaders',
    slug: 'loaders',
    mainCategoryId: 'logistics',
    translationKey: 'categories.sub.loaders',
    sortOrder: 2,
  },
  {
    id: 'construction-waste-removal',
    slug: 'construction-waste-removal',
    mainCategoryId: 'logistics',
    translationKey: 'categories.sub.constructionWasteRemoval',
    sortOrder: 3,
  },
  {
    id: 'furniture-appliance-moving',
    slug: 'furniture-appliance-moving',
    mainCategoryId: 'logistics',
    translationKey: 'categories.sub.furnitureApplianceMoving',
    sortOrder: 4,
  },
  {
    id: 'office-relocation',
    slug: 'office-relocation',
    mainCategoryId: 'logistics',
    translationKey: 'categories.sub.officeRelocation',
    sortOrder: 5,
  },
  {
    id: 'passenger-transfer',
    slug: 'passenger-transfer',
    mainCategoryId: 'logistics',
    translationKey: 'categories.sub.passengerTransfer',
    sortOrder: 6,
  },

  // ===== HOUSEHOLD SERVICES (Бытовые услуги) =====
  {
    id: 'gardening',
    slug: 'gardening',
    mainCategoryId: 'household-services',
    translationKey: 'categories.sub.gardening',
    sortOrder: 1,
  },
  {
    id: 'babysitting',
    slug: 'babysitting',
    mainCategoryId: 'household-services',
    translationKey: 'categories.sub.babysitting',
    sortOrder: 2,
  },
  {
    id: 'caregiver',
    slug: 'caregiver',
    mainCategoryId: 'household-services',
    translationKey: 'categories.sub.caregiver',
    sortOrder: 3,
  },
  {
    id: 'housekeeper',
    slug: 'housekeeper',
    mainCategoryId: 'household-services',
    translationKey: 'categories.sub.housekeeper',
    sortOrder: 4,
  },
  {
    id: 'sewing',
    slug: 'sewing',
    mainCategoryId: 'household-services',
    translationKey: 'categories.sub.sewing',
    sortOrder: 5,
  },

  // ===== AUTO REPAIR (Ремонт авто) =====
  {
    id: 'roadside-assistance',
    slug: 'roadside-assistance',
    mainCategoryId: 'auto-repair',
    translationKey: 'categories.sub.roadsideAssistance',
    sortOrder: 1,
  },
  {
    id: 'maintenance-diagnostics',
    slug: 'maintenance-diagnostics',
    mainCategoryId: 'auto-repair',
    translationKey: 'categories.sub.maintenanceDiagnostics',
    sortOrder: 2,
  },
  {
    id: 'auto-electrical',
    slug: 'auto-electrical',
    mainCategoryId: 'auto-repair',
    translationKey: 'categories.sub.autoElectrical',
    sortOrder: 3,
  },
  {
    id: 'body-work',
    slug: 'body-work',
    mainCategoryId: 'auto-repair',
    translationKey: 'categories.sub.bodyWork',
    sortOrder: 4,
  },
  {
    id: 'engine-repair',
    slug: 'engine-repair',
    mainCategoryId: 'auto-repair',
    translationKey: 'categories.sub.engineRepair',
    sortOrder: 5,
  },

  // ===== COURIER SERVICES (Курьерские услуги) =====
  {
    id: 'courier-delivery',
    slug: 'courier-delivery',
    mainCategoryId: 'courier-services',
    translationKey: 'categories.sub.courierDelivery',
    sortOrder: 1,
  },
  {
    id: 'grocery-delivery',
    slug: 'grocery-delivery',
    mainCategoryId: 'courier-services',
    translationKey: 'categories.sub.groceryDelivery',
    sortOrder: 2,
  },
  {
    id: 'food-delivery',
    slug: 'food-delivery',
    mainCategoryId: 'courier-services',
    translationKey: 'categories.sub.foodDelivery',
    sortOrder: 3,
  },
  {
    id: 'medicine-delivery',
    slug: 'medicine-delivery',
    mainCategoryId: 'courier-services',
    translationKey: 'categories.sub.medicineDelivery',
    sortOrder: 4,
  },
  {
    id: 'courier-by-car',
    slug: 'courier-by-car',
    mainCategoryId: 'courier-services',
    translationKey: 'categories.sub.courierByCar',
    sortOrder: 5,
  },

  // ===== DIGITAL MARKETING =====
  {
    id: 'contextual-advertising',
    slug: 'contextual-advertising',
    mainCategoryId: 'digital-marketing',
    translationKey: 'categories.sub.contextualAdvertising',
    sortOrder: 1,
  },
  {
    id: 'seo-optimization',
    slug: 'seo-optimization',
    mainCategoryId: 'digital-marketing',
    translationKey: 'categories.sub.seoOptimization',
    sortOrder: 2,
  },
  {
    id: 'copywriting',
    slug: 'copywriting',
    mainCategoryId: 'digital-marketing',
    translationKey: 'categories.sub.copywriting',
    sortOrder: 3,
  },
  {
    id: 'social-media-marketing',
    slug: 'social-media-marketing',
    mainCategoryId: 'digital-marketing',
    translationKey: 'categories.sub.socialMediaMarketing',
    sortOrder: 4,
  },
  {
    id: 'email-marketing',
    slug: 'email-marketing',
    mainCategoryId: 'digital-marketing',
    translationKey: 'categories.sub.emailMarketing',
    sortOrder: 5,
  },

  // ===== AI SERVICES (AI услуги) =====
  {
    id: 'ai-content-creation',
    slug: 'ai-content-creation',
    mainCategoryId: 'ai-services',
    translationKey: 'categories.sub.aiContentCreation',
    sortOrder: 1,
  },
  {
    id: 'ai-consulting',
    slug: 'ai-consulting',
    mainCategoryId: 'ai-services',
    translationKey: 'categories.sub.aiConsulting',
    sortOrder: 2,
  },
  {
    id: 'ai-development',
    slug: 'ai-development',
    mainCategoryId: 'ai-services',
    translationKey: 'categories.sub.aiDevelopment',
    sortOrder: 3,
  },
  {
    id: 'ai-data-analytics',
    slug: 'ai-data-analytics',
    mainCategoryId: 'ai-services',
    translationKey: 'categories.sub.aiDataAnalytics',
    sortOrder: 4,
  },

  // ===== ONLINE ADVERTISING (Другая реклама в Интернете) =====
  {
    id: 'online-ad-placement',
    slug: 'online-ad-placement',
    mainCategoryId: 'online-advertising',
    translationKey: 'categories.sub.onlineAdPlacement',
    sortOrder: 1,
  },

  // ===== ADVERTISING DISTRIBUTION (Распространение рекламы) =====
  {
    id: 'flyer-distribution',
    slug: 'flyer-distribution',
    mainCategoryId: 'advertising-distribution',
    translationKey: 'categories.sub.flyerDistribution',
    sortOrder: 1,
  },
  {
    id: 'poster-hanging',
    slug: 'poster-hanging',
    mainCategoryId: 'advertising-distribution',
    translationKey: 'categories.sub.posterHanging',
    sortOrder: 2,
  },
  {
    id: 'mailbox-advertising',
    slug: 'mailbox-advertising',
    mainCategoryId: 'advertising-distribution',
    translationKey: 'categories.sub.mailboxAdvertising',
    sortOrder: 3,
  },
  {
    id: 'sandwich-board-advertising',
    slug: 'sandwich-board-advertising',
    mainCategoryId: 'advertising-distribution',
    translationKey: 'categories.sub.sandwichBoardAdvertising',
    sortOrder: 4,
  },

  // ===== DESIGN (Дизайн) =====
  {
    id: 'logo-design',
    slug: 'logo-design',
    mainCategoryId: 'design',
    translationKey: 'categories.sub.logoDesign',
    sortOrder: 1,
  },
  {
    id: 'interior-design',
    slug: 'interior-design',
    mainCategoryId: 'design',
    translationKey: 'categories.sub.interiorDesign',
    sortOrder: 2,
  },
  {
    id: 'web-app-design',
    slug: 'web-app-design',
    mainCategoryId: 'design',
    translationKey: 'categories.sub.webAppDesign',
    sortOrder: 3,
  },
  {
    id: 'print-design',
    slug: 'print-design',
    mainCategoryId: 'design',
    translationKey: 'categories.sub.printDesign',
    sortOrder: 4,
  },
  {
    id: 'printing-services',
    slug: 'printing-services',
    mainCategoryId: 'design',
    translationKey: 'categories.sub.printingServices',
    sortOrder: 5,
  },

  // ===== TUTORING (Услуги репетиторов) =====
  {
    id: 'subject-tutors',
    slug: 'subject-tutors',
    mainCategoryId: 'tutoring',
    translationKey: 'categories.sub.subjectTutors',
    sortOrder: 1,
  },
  {
    id: 'language-tutors',
    slug: 'language-tutors',
    mainCategoryId: 'tutoring',
    translationKey: 'categories.sub.languageTutors',
    sortOrder: 2,
  },
  {
    id: 'academic-writing',
    slug: 'academic-writing',
    mainCategoryId: 'tutoring',
    translationKey: 'categories.sub.academicWriting',
    sortOrder: 3,
  },
  {
    id: 'music-teachers',
    slug: 'music-teachers',
    mainCategoryId: 'tutoring',
    translationKey: 'categories.sub.musicTeachers',
    sortOrder: 4,
  },
  {
    id: 'driving-instructors',
    slug: 'driving-instructors',
    mainCategoryId: 'tutoring',
    translationKey: 'categories.sub.drivingInstructors',
    sortOrder: 5,
  },

  // ===== WEB DEVELOPMENT (Разработка сайтов и приложений) =====
  {
    id: 'website-creation',
    slug: 'website-creation',
    mainCategoryId: 'web-development',
    translationKey: 'categories.sub.websiteCreation',
    sortOrder: 1,
  },
  {
    id: 'website-improvements',
    slug: 'website-improvements',
    mainCategoryId: 'web-development',
    translationKey: 'categories.sub.websiteImprovements',
    sortOrder: 2,
  },
  {
    id: 'landing-page',
    slug: 'landing-page',
    mainCategoryId: 'web-development',
    translationKey: 'categories.sub.landingPage',
    sortOrder: 3,
  },
  {
    id: 'website-layout',
    slug: 'website-layout',
    mainCategoryId: 'web-development',
    translationKey: 'categories.sub.websiteLayout',
    sortOrder: 4,
  },
  {
    id: 'qa-testing',
    slug: 'qa-testing',
    mainCategoryId: 'web-development',
    translationKey: 'categories.sub.qaTesting',
    sortOrder: 5,
  },

  // ===== ONLINE WORK (Работа в Интернете) =====
  {
    id: 'data-research',
    slug: 'data-research',
    mainCategoryId: 'online-work',
    translationKey: 'categories.sub.dataResearch',
    sortOrder: 1,
  },
  {
    id: 'content-filling',
    slug: 'content-filling',
    mainCategoryId: 'online-work',
    translationKey: 'categories.sub.contentFilling',
    sortOrder: 2,
  },
  {
    id: 'typing',
    slug: 'typing',
    mainCategoryId: 'online-work',
    translationKey: 'categories.sub.typing',
    sortOrder: 3,
  },
  {
    id: 'data-entry',
    slug: 'data-entry',
    mainCategoryId: 'online-work',
    translationKey: 'categories.sub.dataEntry',
    sortOrder: 4,
  },
  {
    id: 'transcription',
    slug: 'transcription',
    mainCategoryId: 'online-work',
    translationKey: 'categories.sub.transcription',
    sortOrder: 5,
  },

  // ===== PHOTO/VIDEO SERVICES (Фото- и видео- услуги) =====
  {
    id: 'photographer',
    slug: 'photographer',
    mainCategoryId: 'photo-video',
    translationKey: 'categories.sub.photographer',
    sortOrder: 1,
  },
  {
    id: 'videographer',
    slug: 'videographer',
    mainCategoryId: 'photo-video',
    translationKey: 'categories.sub.videographer',
    sortOrder: 2,
  },
  {
    id: 'photo-editing',
    slug: 'photo-editing',
    mainCategoryId: 'photo-video',
    translationKey: 'categories.sub.photoEditing',
    sortOrder: 3,
  },
  {
    id: 'video-editing',
    slug: 'video-editing',
    mainCategoryId: 'photo-video',
    translationKey: 'categories.sub.videoEditing',
    sortOrder: 4,
  },
  {
    id: 'video-digitization',
    slug: 'video-digitization',
    mainCategoryId: 'photo-video',
    translationKey: 'categories.sub.videoDigitization',
    sortOrder: 5,
  },

  // ===== BUSINESS SERVICES (Деловые услуги) =====
  {
    id: 'accounting',
    slug: 'accounting',
    mainCategoryId: 'business-services',
    translationKey: 'categories.sub.accounting',
    sortOrder: 1,
  },
  {
    id: 'legal-services',
    slug: 'legal-services',
    mainCategoryId: 'business-services',
    translationKey: 'categories.sub.legalServices',
    sortOrder: 2,
  },
  {
    id: 'real-estate',
    slug: 'real-estate',
    mainCategoryId: 'business-services',
    translationKey: 'categories.sub.realEstate',
    sortOrder: 3,
  },
  {
    id: 'call-center',
    slug: 'call-center',
    mainCategoryId: 'business-services',
    translationKey: 'categories.sub.callCenter',
    sortOrder: 4,
  },
  {
    id: 'financial-services',
    slug: 'financial-services',
    mainCategoryId: 'business-services',
    translationKey: 'categories.sub.financialServices',
    sortOrder: 5,
  },

  // ===== PET SERVICES (Услуги для животных) =====
  {
    id: 'cat-care',
    slug: 'cat-care',
    mainCategoryId: 'pet-services',
    translationKey: 'categories.sub.catCare',
    sortOrder: 1,
  },
  {
    id: 'dog-care',
    slug: 'dog-care',
    mainCategoryId: 'pet-services',
    translationKey: 'categories.sub.dogCare',
    sortOrder: 2,
  },
  {
    id: 'pet-hotel',
    slug: 'pet-hotel',
    mainCategoryId: 'pet-services',
    translationKey: 'categories.sub.petHotel',
    sortOrder: 3,
  },
  {
    id: 'pet-transportation',
    slug: 'pet-transportation',
    mainCategoryId: 'pet-services',
    translationKey: 'categories.sub.petTransportation',
    sortOrder: 4,
  },
  {
    id: 'fish-care',
    slug: 'fish-care',
    mainCategoryId: 'pet-services',
    translationKey: 'categories.sub.fishCare',
    sortOrder: 5,
  },

  // ===== BEAUTY & HEALTH (Услуги красоты и здоровья) =====
  {
    id: 'massage',
    slug: 'massage',
    mainCategoryId: 'beauty-health',
    translationKey: 'categories.sub.massage',
    sortOrder: 1,
  },
  {
    id: 'nail-care',
    slug: 'nail-care',
    mainCategoryId: 'beauty-health',
    translationKey: 'categories.sub.nailCare',
    sortOrder: 2,
  },
  {
    id: 'cosmetology',
    slug: 'cosmetology',
    mainCategoryId: 'beauty-health',
    translationKey: 'categories.sub.cosmetology',
    sortOrder: 3,
  },
  {
    id: 'lash-care',
    slug: 'lash-care',
    mainCategoryId: 'beauty-health',
    translationKey: 'categories.sub.lashCare',
    sortOrder: 4,
  },
  {
    id: 'brow-care',
    slug: 'brow-care',
    mainCategoryId: 'beauty-health',
    translationKey: 'categories.sub.browCare',
    sortOrder: 5,
  },
  {
    id: 'psychologist',
    slug: 'psychologist',
    mainCategoryId: 'beauty-health',
    translationKey: 'categories.sub.psychologist',
    sortOrder: 6,
  },

  // ===== EVENT PLANNING (Организация праздников) =====
  {
    id: 'event-host',
    slug: 'event-host',
    mainCategoryId: 'event-planning',
    translationKey: 'categories.sub.eventHost',
    sortOrder: 1,
  },
  {
    id: 'music-entertainment',
    slug: 'music-entertainment',
    mainCategoryId: 'event-planning',
    translationKey: 'categories.sub.musicEntertainment',
    sortOrder: 2,
  },
  {
    id: 'animators',
    slug: 'animators',
    mainCategoryId: 'event-planning',
    translationKey: 'categories.sub.animators',
    sortOrder: 3,
  },
  {
    id: 'catering',
    slug: 'catering',
    mainCategoryId: 'event-planning',
    translationKey: 'categories.sub.catering',
    sortOrder: 4,
  },
  {
    id: 'baking-desserts',
    slug: 'baking-desserts',
    mainCategoryId: 'event-planning',
    translationKey: 'categories.sub.bakingDesserts',
    sortOrder: 5,
  },

  // ===== TRANSLATION SERVICES (Бюро переводов) =====
  {
    id: 'written-translation',
    slug: 'written-translation',
    mainCategoryId: 'translation-services',
    translationKey: 'categories.sub.writtenTranslation',
    sortOrder: 1,
  },
  {
    id: 'translation-editing',
    slug: 'translation-editing',
    mainCategoryId: 'translation-services',
    translationKey: 'categories.sub.translationEditing',
    sortOrder: 2,
  },
  {
    id: 'document-translation',
    slug: 'document-translation',
    mainCategoryId: 'translation-services',
    translationKey: 'categories.sub.documentTranslation',
    sortOrder: 3,
  },
  {
    id: 'oral-translation',
    slug: 'oral-translation',
    mainCategoryId: 'translation-services',
    translationKey: 'categories.sub.oralTranslation',
    sortOrder: 4,
  },
  {
    id: 'technical-translation',
    slug: 'technical-translation',
    mainCategoryId: 'translation-services',
    translationKey: 'categories.sub.technicalTranslation',
    sortOrder: 5,
  },

  // ===== TRAINER SERVICES (Услуги тренеров) =====
  {
    id: 'yoga',
    slug: 'yoga',
    mainCategoryId: 'trainer-services',
    translationKey: 'categories.sub.yoga',
    sortOrder: 1,
  },
  {
    id: 'group-fitness',
    slug: 'group-fitness',
    mainCategoryId: 'trainer-services',
    translationKey: 'categories.sub.groupFitness',
    sortOrder: 2,
  },
  {
    id: 'team-sports',
    slug: 'team-sports',
    mainCategoryId: 'trainer-services',
    translationKey: 'categories.sub.teamSports',
    sortOrder: 3,
  },
  {
    id: 'water-sports',
    slug: 'water-sports',
    mainCategoryId: 'trainer-services',
    translationKey: 'categories.sub.waterSports',
    sortOrder: 4,
  },
  {
    id: 'martial-arts',
    slug: 'martial-arts',
    mainCategoryId: 'trainer-services',
    translationKey: 'categories.sub.martialArts',
    sortOrder: 5,
  },

  // ===== VOLUNTEER HELP (Волонтерская помощь) =====
  {
    id: 'elderly-assistance',
    slug: 'elderly-assistance',
    mainCategoryId: 'volunteer-help',
    translationKey: 'categories.sub.elderlyAssistance',
    sortOrder: 1,
  },
  {
    id: 'volunteer-transportation',
    slug: 'volunteer-transportation',
    mainCategoryId: 'volunteer-help',
    translationKey: 'categories.sub.volunteerTransportation',
    sortOrder: 2,
  },
  {
    id: 'fuel-delivery',
    slug: 'fuel-delivery',
    mainCategoryId: 'volunteer-help',
    translationKey: 'categories.sub.fuelDelivery',
    sortOrder: 3,
  },
  {
    id: 'housing-assistance',
    slug: 'housing-assistance',
    mainCategoryId: 'volunteer-help',
    translationKey: 'categories.sub.housingAssistance',
    sortOrder: 4,
  },
  {
    id: 'volunteer-food-delivery',
    slug: 'volunteer-food-delivery',
    mainCategoryId: 'volunteer-help',
    translationKey: 'categories.sub.volunteerFoodDelivery',
    sortOrder: 5,
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

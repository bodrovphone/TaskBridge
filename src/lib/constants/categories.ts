export const TASK_CATEGORIES = {
  // Home & Repair Services
  "plumbing": "categories.plumbing",
  "electrical": "categories.electrical", 
  "hvac": "categories.hvac",
  "carpentry": "categories.carpentry",
  "painting": "categories.painting",
  "flooring": "categories.flooring",
  "roofing": "categories.roofing",
  "home_renovation": "categories.homeRenovation",
  "appliance_repair": "categories.applianceRepair",
  "handyman": "categories.handyman",
  
  // Cleaning & Maintenance
  "house_cleaning": "categories.houseCleaning",
  "deep_cleaning": "categories.deepCleaning",
  "carpet_cleaning": "categories.carpetCleaning",
  "window_cleaning": "categories.windowCleaning",
  "garden_maintenance": "categories.gardenMaintenance",
  "landscaping": "categories.landscaping",
  
  // Transportation & Delivery
  "delivery": "categories.delivery",
  "moving": "categories.moving",
  "taxi_driver": "categories.taxiDriver",
  "courier": "categories.courier",
  
  // Personal Services
  "babysitting": "categories.babysitting",
  "elderly_care": "categories.elderlyCare",
  "pet_sitting": "categories.petSitting",
  "personal_trainer": "categories.personalTrainer",
  "massage_therapy": "categories.massageTherapy",
  
  // Professional Services
  "tutoring": "categories.tutoring",
  "translation": "categories.translation",
  "accounting": "categories.accounting",
  "legal_services": "categories.legalServices",
  "consulting": "categories.consulting",
  
  // Creative & Digital
  "graphic_design": "categories.graphicDesign",
  "web_development": "categories.webDevelopment",
  "photography": "categories.photography",
  "videography": "categories.videography",
  "writing": "categories.writing",
  "music_lessons": "categories.musicLessons",
  
  // Events & Entertainment
  "event_planning": "categories.eventPlanning",
  "catering": "categories.catering",
  "dj_services": "categories.djServices",
  
  // Beauty & Wellness
  "hairdressing": "categories.hairdressing",
  "makeup_artist": "categories.makeupArtist",
  "nail_services": "categories.nailServices",
  
  // Other
  "other": "categories.other"
} as const;

export type TaskCategory = keyof typeof TASK_CATEGORIES;

export const getCategoryLabel = (category: TaskCategory, t: (key: string) => string): string => {
  return t(TASK_CATEGORIES[category]);
};

// Helper function to get all categories as options
export const getCategoryOptions = (t: (key: string) => string) => {
  return Object.entries(TASK_CATEGORIES).map(([key, translationKey]) => ({
    value: key as TaskCategory,
    label: t(translationKey),
    translationKey
  }));
};
import { Application, ApplicationProfessional, ProfessionalReview } from '@/types/applications'

// Mock professional reviews
const mockReviews: ProfessionalReview[] = [
  {
    id: 'review-1',
    reviewerName: 'Maria Dimitrova',
    reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop',
    rating: 5,
    comment: 'Excellent work! Very professional and completed on time.',
    createdAt: new Date('2025-01-10'),
    taskCategory: 'Plumbing'
  },
  {
    id: 'review-2',
    reviewerName: 'Ivan Petrov',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
    rating: 4,
    comment: 'Good service, would recommend.',
    createdAt: new Date('2025-01-05'),
    taskCategory: 'Home Repair'
  },
  {
    id: 'review-3',
    reviewerName: 'Elena Georgieva',
    reviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop',
    rating: 5,
    comment: 'Outstanding! Fixed the issue quickly and efficiently.',
    createdAt: new Date('2024-12-28'),
    taskCategory: 'Plumbing'
  }
]

// Mock professionals
const mockProfessionals: ApplicationProfessional[] = [
  {
    id: 'prof-1',
    name: 'Ivan Georgiev',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    rating: 4.8,
    completedTasks: 45,
    skills: ['categories.plumbing', 'categories.homeRepair'],
    hourlyRate: 45,
    bio: 'Licensed plumber with 5 years of experience',
    city: 'Sofia',
    reviews: mockReviews,
    yearsOfExperience: 5,
    verified: true
  },
  {
    id: 'prof-2',
    name: 'Maria Petrova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    rating: 4.9,
    completedTasks: 67,
    skills: ['categories.electrical', 'categories.homeRepair'],
    hourlyRate: 50,
    bio: 'Certified electrician specializing in installations',
    city: 'Sofia',
    reviews: mockReviews.slice(0, 2),
    yearsOfExperience: 8,
    verified: true
  },
  {
    id: 'prof-3',
    name: 'Georgi Dimitrov',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    rating: 4.6,
    completedTasks: 32,
    skills: ['categories.carpentry', 'categories.furnitureAssembly'],
    hourlyRate: 40,
    bio: 'Custom carpentry and furniture work',
    city: 'Plovdiv',
    reviews: mockReviews.slice(1, 3),
    yearsOfExperience: 3,
    verified: false
  },
  {
    id: 'prof-4',
    name: 'Dimitar Ivanov',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 4.7,
    completedTasks: 53,
    skills: ['categories.painting', 'categories.homeRepair'],
    hourlyRate: 35,
    bio: 'Interior painting and wallpaper specialist',
    city: 'Varna',
    reviews: mockReviews,
    yearsOfExperience: 6,
    verified: true
  },
  {
    id: 'prof-5',
    name: 'Stefan Todorov',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop',
    rating: 4.5,
    completedTasks: 28,
    skills: ['categories.applianceRepair'],
    hourlyRate: 55,
    bio: 'HVAC specialist with focus on heating and cooling',
    city: 'Burgas',
    reviews: mockReviews.slice(0, 1),
    yearsOfExperience: 4,
    verified: true
  }
]

// Mock applications
export const mockApplications: Application[] = [
  // Applications for Task 1 (Dog walking)
  {
    id: 'app-1',
    taskId: '1',
    professional: mockProfessionals[0],
    proposedPrice: 18,
    currency: 'EUR',
    timeline: '7 days',
    message: 'I have extensive experience walking large dogs and live nearby in Lozenets. I can walk your dog twice daily at the requested times and send photos during each walk. Available to start immediately.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop'
    ],
    experience: '5 years walking dogs, specialized in large breeds',
    status: 'pending',
    createdAt: new Date('2025-01-15T10:30:00'),
    updatedAt: new Date('2025-01-15T10:30:00')
  },
  {
    id: 'app-2',
    taskId: '1',
    professional: mockProfessionals[1],
    proposedPrice: 22,
    currency: 'EUR',
    timeline: '7 days',
    message: 'Hello! I\'m a professional dog trainer and walker with 8 years of experience. I specialize in large breeds and can provide exercise and basic training during walks. I live in the area and am very flexible with timing.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop'
    ],
    status: 'pending',
    createdAt: new Date('2025-01-15T14:20:00'),
    updatedAt: new Date('2025-01-15T14:20:00')
  },
  {
    id: 'app-3',
    taskId: '1',
    professional: mockProfessionals[2],
    proposedPrice: 15,
    currency: 'EUR',
    timeline: '7 days',
    message: 'I love dogs and have experience walking them. I can definitely help with your large dog. My schedule is very flexible and I can accommodate the morning and evening walks. Let me know if you have any questions.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=600&fit=crop'
    ],
    status: 'pending',
    createdAt: new Date('2025-01-16T09:15:00'),
    updatedAt: new Date('2025-01-16T09:15:00')
  },
  // Applications for Task 3 (Apartment cleaning)
  {
    id: 'app-4',
    taskId: '3',
    professional: mockProfessionals[3],
    proposedPrice: 70,
    currency: 'EUR',
    timeline: '1 day',
    message: 'Professional cleaning service with 6 years experience. I have all necessary equipment including window cleaning tools. I can clean your 75 sq.m apartment thoroughly including the terrace. Available on weekdays.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop'
    ],
    status: 'pending',
    createdAt: new Date('2025-01-16T11:45:00'),
    updatedAt: new Date('2025-01-16T11:45:00')
  },
  {
    id: 'app-5',
    taskId: '3',
    professional: mockProfessionals[4],
    proposedPrice: 65,
    currency: 'EUR',
    timeline: '1 day',
    message: 'Experienced cleaning professional with attention to detail. I specialize in thorough apartment cleaning including windows and outdoor areas. Can provide eco-friendly cleaning products if preferred. Fair pricing and quality guaranteed.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop'
    ],
    status: 'pending',
    createdAt: new Date('2025-01-17T08:30:00'),
    updatedAt: new Date('2025-01-17T08:30:00')
  }
]

/**
 * Get applications for a specific task
 */
export function getApplicationsForTask(taskId: string): Application[] {
  return mockApplications.filter(app => app.taskId === taskId)
}

/**
 * Get a single application by ID
 */
export function getApplicationById(id: string): Application | undefined {
  return mockApplications.find(app => app.id === id)
}

/**
 * Get application statistics
 */
export function getApplicationStats(taskId: string) {
  const apps = getApplicationsForTask(taskId)
  return {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length
  }
}

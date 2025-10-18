import { MyApplication } from './types'

/**
 * Mock Applications from Professional's Perspective
 *
 * This represents applications that a professional has submitted to various tasks.
 * Contact information is only included for accepted applications.
 */

export const mockMyApplications: MyApplication[] = [
  // PENDING APPLICATION #1 - Plumbing
  {
    id: 'my-app-1',
    taskId: '1', // Links to existing task mock data
    task: {
      id: '1',
      title: 'Fix Kitchen Sink Leak',
      description: 'Kitchen sink is leaking under the cabinet. Need urgent repair.',
      category: 'home_repair',
      subcategory: 'plumbing',
      budget: {
        min: 100,
        max: 200,
        type: 'negotiable'
      },
      location: {
        city: 'Sofia',
        neighborhood: 'Center'
      },
      deadline: new Date('2025-01-20'),
      status: 'open'
    },
    customer: {
      id: 'customer-1',
      name: 'John D.', // Partial name - not accepted yet
      avatar: '/avatars/customer1.jpg',
      rating: 4.5,
      reviewsCount: 12
    },
    myProposal: {
      price: 150,
      currency: 'BGN',
      timeline: '2-3 days',
      message: 'I have 5 years of experience in residential plumbing and can fix this issue quickly. I use high-quality parts and provide a 1-year warranty on all repairs.'
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    otherApplicantsCount: 3
  },

  // ACCEPTED APPLICATION #1 - Cleaning
  {
    id: 'my-app-2',
    taskId: '3', // Links to existing task
    task: {
      id: '3',
      title: 'Apartment Deep Cleaning',
      description: '3-bedroom apartment needs thorough deep cleaning before new tenants move in.',
      category: 'personal_care',
      subcategory: 'cleaning',
      budget: {
        min: 150,
        max: 250,
        type: 'fixed'
      },
      location: {
        city: 'Plovdiv',
        neighborhood: 'Center'
      },
      deadline: new Date('2025-01-19'),
      status: 'in_progress'
    },
    customer: {
      id: 'customer-2',
      name: 'Maria Petrova', // Full name - accepted
      avatar: '/avatars/customer2.jpg',
      rating: 4.8,
      reviewsCount: 25,
      // Contact info revealed after acceptance
      phone: '+359 888 123 456',
      email: 'maria.p@example.com',
      address: 'ul. Ivan Vazov 15, apt. 5, Plovdiv'
    },
    myProposal: {
      price: 200,
      currency: 'BGN',
      timeline: '3 days',
      message: 'I specialize in apartment deep cleaning with eco-friendly products. My team and I have cleaned over 200 apartments with excellent results.'
    },
    status: 'accepted',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // Tomorrow at 10 AM
  },

  // REJECTED APPLICATION #1 - Painting
  {
    id: 'my-app-3',
    taskId: 'task-paint-1',
    task: {
      id: 'task-paint-1',
      title: 'Paint Living Room Walls',
      description: 'Need professional painting for 25sqm living room. White color.',
      category: 'home_repair',
      subcategory: 'painting',
      budget: {
        min: 200,
        max: 400,
        type: 'negotiable'
      },
      location: {
        city: 'Varna',
        neighborhood: 'Seaside'
      },
      status: 'completed'
    },
    customer: {
      id: 'customer-3',
      name: 'Ivan K.',
      rating: 4.2,
      reviewsCount: 8
    },
    myProposal: {
      price: 300,
      currency: 'BGN',
      timeline: '2 days',
      message: 'Professional painter with 10 years experience. I use premium paints and guarantee smooth, even coverage.'
    },
    status: 'rejected',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    rejectionReason: 'Found a better fit'
  },

  // PENDING APPLICATION #2 - Electrical
  {
    id: 'my-app-4',
    taskId: 'task-electric-1',
    task: {
      id: 'task-electric-1',
      title: 'Install New Light Fixtures',
      description: 'Need electrician to install 5 new LED ceiling lights in apartment.',
      category: 'home_repair',
      subcategory: 'electrical',
      budget: {
        min: 80,
        max: 150,
        type: 'fixed'
      },
      location: {
        city: 'Sofia',
        neighborhood: 'Lozenets'
      },
      deadline: new Date('2025-01-18'),
      status: 'open'
    },
    customer: {
      id: 'customer-4',
      name: 'Elena S.',
      avatar: '/avatars/customer4.jpg',
      rating: 4.6,
      reviewsCount: 15
    },
    myProposal: {
      price: 120,
      currency: 'BGN',
      timeline: '1 day',
      message: 'Licensed electrician with all necessary certifications. Can complete the installation in one day with minimal disruption.'
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    otherApplicantsCount: 5
  },

  // ACCEPTED APPLICATION #2 - Pet Care
  {
    id: 'my-app-5',
    taskId: 'task-dog-1',
    task: {
      id: 'task-dog-1',
      title: 'Dog Walking - Golden Retriever',
      description: 'Need someone to walk my friendly Golden Retriever twice daily for 2 weeks.',
      category: 'personal_care',
      subcategory: 'pet_care',
      budget: {
        min: 200,
        max: 300,
        type: 'fixed'
      },
      location: {
        city: 'Sofia',
        neighborhood: 'Mladost'
      },
      deadline: new Date('2025-01-25'),
      status: 'in_progress'
    },
    customer: {
      id: 'customer-5',
      name: 'Georgi Ivanov',
      avatar: '/avatars/customer5.jpg',
      rating: 5.0,
      reviewsCount: 8,
      phone: '+359 887 654 321',
      email: 'georgi.i@example.com',
      address: 'bul. Tsarigradsko Shose 123, Sofia'
    },
    myProposal: {
      price: 250,
      currency: 'BGN',
      timeline: '2 weeks',
      message: 'I love dogs and have experience with large breeds. I walk in the nearby park and always ensure dogs get plenty of exercise and play time.'
    },
    status: 'accepted',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    respondedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Started 3 days ago
  },

  // REJECTED APPLICATION #2 - Delivery
  {
    id: 'my-app-6',
    taskId: 'task-delivery-1',
    task: {
      id: 'task-delivery-1',
      title: 'Furniture Delivery and Assembly',
      description: 'Need help delivering and assembling IKEA furniture.',
      category: 'delivery_transport',
      subcategory: 'delivery',
      budget: {
        min: 50,
        max: 100,
        type: 'negotiable'
      },
      location: {
        city: 'Burgas',
        neighborhood: 'Center'
      },
      status: 'completed'
    },
    customer: {
      id: 'customer-6',
      name: 'Petya M.',
      rating: 4.0,
      reviewsCount: 5
    },
    myProposal: {
      price: 80,
      currency: 'BGN',
      timeline: 'Same day',
      message: 'I have a van and tools for furniture assembly. Can complete delivery and assembly in one trip.'
    },
    status: 'rejected',
    appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    respondedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    rejectionReason: 'Price too high'
  },

  // PENDING APPLICATION #3 - Tutoring
  {
    id: 'my-app-7',
    taskId: 'task-tutor-1',
    task: {
      id: 'task-tutor-1',
      title: 'Math Tutoring for High School Student',
      description: 'Need experienced math tutor for 11th grade student preparing for exams.',
      category: 'learning_fitness',
      subcategory: 'tutoring',
      budget: {
        min: 300,
        max: 500,
        type: 'hourly'
      },
      location: {
        city: 'Sofia',
        neighborhood: 'Studentski Grad'
      },
      deadline: new Date('2025-02-01'),
      status: 'open'
    },
    customer: {
      id: 'customer-7',
      name: 'Diana T.',
      avatar: '/avatars/customer7.jpg',
      rating: 4.9,
      reviewsCount: 20
    },
    myProposal: {
      price: 40,
      currency: 'BGN',
      timeline: '2 months, 2x/week',
      message: 'Mathematics teacher with 8 years experience. I have helped many students improve their grades and pass exams successfully.'
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    otherApplicantsCount: 7
  },

  // WITHDRAWN APPLICATION #1
  {
    id: 'my-app-8',
    taskId: 'task-moving-1',
    task: {
      id: 'task-moving-1',
      title: 'Moving Assistance - 2 Bedroom Apartment',
      description: 'Need help moving from one apartment to another in same neighborhood.',
      category: 'delivery_transport',
      subcategory: 'moving',
      budget: {
        min: 150,
        max: 250,
        type: 'negotiable'
      },
      location: {
        city: 'Plovdiv',
        neighborhood: 'Kapana'
      },
      status: 'open'
    },
    customer: {
      id: 'customer-8',
      name: 'Stefan P.',
      rating: 4.3,
      reviewsCount: 6
    },
    myProposal: {
      price: 200,
      currency: 'BGN',
      timeline: '1 day',
      message: 'Professional moving service with truck and equipment. We handle everything carefully.'
    },
    status: 'withdrawn',
    appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },

  // PENDING APPLICATION #4 - Recent
  {
    id: 'my-app-9',
    taskId: '2', // Links to existing task
    task: {
      id: '2',
      title: 'Graphic Design - Logo Creation',
      description: 'Need a professional logo for my new business.',
      category: 'other',
      subcategory: 'design',
      budget: {
        min: 100,
        max: 300,
        type: 'fixed'
      },
      location: {
        city: 'Sofia',
        neighborhood: 'Center'
      },
      deadline: new Date('2025-01-22'),
      status: 'open'
    },
    customer: {
      id: 'customer-9',
      name: 'Alexander D.',
      avatar: '/avatars/customer9.jpg',
      rating: 4.7,
      reviewsCount: 11
    },
    myProposal: {
      price: 250,
      currency: 'BGN',
      timeline: '5-7 days',
      message: 'Graphic designer with 6 years experience. I will provide 3 initial concepts and unlimited revisions until you are satisfied.'
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    otherApplicantsCount: 2
  },

  // REJECTED APPLICATION #3 - Old
  {
    id: 'my-app-10',
    taskId: 'task-garden-1',
    task: {
      id: 'task-garden-1',
      title: 'Garden Maintenance and Landscaping',
      description: 'Regular garden maintenance needed for private house.',
      category: 'home_repair',
      subcategory: 'gardening',
      budget: {
        min: 200,
        max: 400,
        type: 'negotiable'
      },
      location: {
        city: 'Varna',
        neighborhood: 'Vinitsa'
      },
      status: 'in_progress'
    },
    customer: {
      id: 'customer-10',
      name: 'Nikolay V.',
      rating: 4.4,
      reviewsCount: 9
    },
    myProposal: {
      price: 350,
      currency: 'BGN',
      timeline: 'Monthly',
      message: 'Professional gardener with own equipment. I can maintain your garden year-round with seasonal adjustments.'
    },
    status: 'rejected',
    appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    respondedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    rejectionReason: 'Task requirements changed'
  }
]

/**
 * Helper function to get applications by status
 */
export function getApplicationsByStatus(status: string): MyApplication[] {
  if (status === 'all') return mockMyApplications
  return mockMyApplications.filter(app => app.status === status)
}

/**
 * Helper function to get application by ID
 */
export function getApplicationById(id: string): MyApplication | undefined {
  return mockMyApplications.find(app => app.id === id)
}

/**
 * Get application statistics
 */
export function getApplicationStats() {
  return {
    total: mockMyApplications.length,
    pending: mockMyApplications.filter(app => app.status === 'pending').length,
    accepted: mockMyApplications.filter(app => app.status === 'accepted').length,
    rejected: mockMyApplications.filter(app => app.status === 'rejected').length,
    withdrawn: mockMyApplications.filter(app => app.status === 'withdrawn').length
  }
}

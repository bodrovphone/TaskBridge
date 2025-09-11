import type { TaskCategory } from '@/lib/constants/categories'

export interface Professional {
  id: string
  name: string
  avatar: string
  rating: number
  reviewsCount: number
  completedJobs: number
  categories: TaskCategory[]
  location: string
  experience: string
  availability: string
  priceRange: string
  description: string
  verified: boolean
  featured: boolean
}

export const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Мария Петрова",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviewsCount: 67,
    completedJobs: 142,
    categories: ["house_cleaning", "deep_cleaning"] as TaskCategory[],
    location: "София, Център",
    experience: "5 години",
    availability: "Достъпна",
    priceRange: "от 25 лв/час",
    description: "Професионално почистване с внимание към детайлите. Използвам екологични препарати и модерна техника.",
    verified: true,
    featured: true
  },
  {
    id: "2", 
    name: "Георги Иванов",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviewsCount: 43,
    completedJobs: 89,
    categories: ["plumbing", "electrical"] as TaskCategory[],
    location: "София, Люлин",
    experience: "8 години",
    availability: "Зает до петък",
    priceRange: "от 40 лв/час",
    description: "Майстор с богат опит в ВиК и електрически инсталации. Гарантирам качествена работа.",
    verified: true,
    featured: true
  },
  {
    id: "3",
    name: "Елена Димитрова", 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    rating: 4.95,
    reviewsCount: 89,
    completedJobs: 203,
    categories: ["tutoring", "translation"] as TaskCategory[],
    location: "София, Студентски град",
    experience: "10 години",
    availability: "Достъпна",
    priceRange: "от 30 лв/час",
    description: "Преподавател по английски език с дългогодишен опит. Индивидуален подход към всеки ученик.",
    verified: true,
    featured: true
  },
  {
    id: "4",
    name: "Димитър Стоянов",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", 
    rating: 4.7,
    reviewsCount: 31,
    completedJobs: 76,
    categories: ["carpentry", "painting"] as TaskCategory[],
    location: "София, Витоша",
    experience: "12 години",
    availability: "Достъпен след 15-то",
    priceRange: "от 35 лв/час",
    description: "Майстор дърводелец и боядисвач. Специализирам се в изработка на мебели по поръчка.",
    verified: true,
    featured: false
  },
  {
    id: "5",
    name: "Анна Николова",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    rating: 4.85,
    reviewsCount: 23,
    completedJobs: 45,
    categories: ["photography", "videography"] as TaskCategory[],
    location: "София, Борово",
    experience: "6 години", 
    availability: "Достъпна",
    priceRange: "от 80 лв/събитие",
    description: "Професионален фотограф и видеограф. Специализирам се в сватби и корпоративни събития.",
    verified: true,
    featured: false
  },
  {
    id: "6",
    name: "Петър Георгиев",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4.6,
    reviewsCount: 15,
    completedJobs: 28,
    categories: ["delivery", "moving"] as TaskCategory[],
    location: "София, Надежда",
    experience: "3 години",
    availability: "Достъпен", 
    priceRange: "от 1 лв/км",
    description: "Бърза и надеждна доставка и преместване. Разполагам с товарен автомобил и помощници.",
    verified: false,
    featured: false
  }
]
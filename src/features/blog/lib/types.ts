/**
 * Blog Article Types
 */

export interface BlogArticle {
  slug: string
  locale: 'bg' | 'en' | 'ru' | 'ua'
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  content: string // HTML content
  author: string
  publishedAt: string // ISO date
  updatedAt?: string // ISO date
  category: string
  tags: string[]
  readingTime: number // minutes
  coverImage?: string
  // SEO
  targetKeyword: string
  relatedLinks: {
    text: string
    href: string
  }[]
  faqs?: {
    question: string
    answer: string
  }[]
}

export interface BlogCategory {
  slug: string
  name: Record<'bg' | 'en' | 'ru' | 'ua', string>
}

// Blog categories
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: 'guides',
    name: {
      bg: 'Ръководства',
      en: 'Guides',
      ru: 'Руководства',
      ua: 'Посібники',
    },
  },
  {
    slug: 'tips',
    name: {
      bg: 'Съвети',
      en: 'Tips',
      ru: 'Советы',
      ua: 'Поради',
    },
  },
  {
    slug: 'pricing',
    name: {
      bg: 'Цени',
      en: 'Pricing',
      ru: 'Цены',
      ua: 'Ціни',
    },
  },
  {
    slug: 'for-professionals',
    name: {
      bg: 'За професионалисти',
      en: 'For Professionals',
      ru: 'Для специалистов',
      ua: 'Для фахівців',
    },
  },
]

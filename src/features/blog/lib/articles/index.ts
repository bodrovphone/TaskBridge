/**
 * Blog Articles Index
 * All articles are exported from here
 */

import { BlogArticle } from '../types'

// Bulgarian articles
import { tarsyaRabotaArticle } from './bg/tarsya-rabota-v-bulgaria'
import { nameriMajstorArticle } from './bg/nameri-majstor-lesno'
import { hamaliBurgasArticle } from './bg/hamali-burgas-ceni'
import { pochistvaneApartamentArticle } from './bg/pochistvane-apartament-ceni'
import { premestvaneCeniArticle } from './bg/premestvane-ceni-bulgaria'

// All articles organized by locale
export const articles: Record<string, BlogArticle[]> = {
  bg: [tarsyaRabotaArticle, nameriMajstorArticle, hamaliBurgasArticle, pochistvaneApartamentArticle, premestvaneCeniArticle],
  en: [],
  ru: [],
  ua: [],
}

// Get all articles for a locale
export function getArticlesByLocale(locale: string): BlogArticle[] {
  return articles[locale] || []
}

// Get article by slug and locale
export function getArticleBySlug(slug: string, locale: string): BlogArticle | undefined {
  const localeArticles = articles[locale] || []
  return localeArticles.find((article) => article.slug === slug)
}

// Get all article slugs for sitemap generation
export function getAllArticleSlugs(): { slug: string; locale: string }[] {
  const slugs: { slug: string; locale: string }[] = []

  Object.entries(articles).forEach(([locale, localeArticles]) => {
    localeArticles.forEach((article) => {
      slugs.push({ slug: article.slug, locale })
    })
  })

  return slugs
}

// Get related articles (same category, different slug)
export function getRelatedArticles(currentSlug: string, locale: string, limit = 3): BlogArticle[] {
  const current = getArticleBySlug(currentSlug, locale)
  if (!current) return []

  const localeArticles = articles[locale] || []
  return localeArticles
    .filter((article) => article.slug !== currentSlug && article.category === current.category)
    .slice(0, limit)
}

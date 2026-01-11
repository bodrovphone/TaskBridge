import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { generateCanonicalUrl, generateAlternateLanguages } from '@/lib/utils/seo'
import { getArticlesByLocale, articles as allArticles } from '@/features/blog'
import { ContentPageHero } from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface BlogPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  return {
    title: t('blog.metaTitle'),
    description: t('blog.metaDescription'),
    alternates: {
      canonical: generateCanonicalUrl(locale, '/blog'),
      languages: generateAlternateLanguages('/blog'),
    },
    openGraph: {
      title: t('blog.metaTitle'),
      description: t('blog.metaDescription'),
      url: `https://trudify.com/${locale}/blog`,
      siteName: 'Trudify',
      type: 'website',
    },
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  // Get articles for current locale, fallback to all articles if none exist
  let articles = getArticlesByLocale(locale)
  if (articles.length === 0) {
    // Show all articles from all locales
    articles = Object.values(allArticles).flat()
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${locale}` },
          { name: t('blog.title'), url: `/${locale}/blog` },
        ]}
      />

      {/* Hero */}
      <ContentPageHero title={t('blog.title')} subtitle={t('blog.subtitle')} />

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">{t('blog.noArticles')}</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const publishDate = new Date(article.publishedAt).toLocaleDateString(
                  locale === 'bg' ? 'bg-BG' : locale === 'ru' ? 'ru-RU' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }
                )

                return (
                  <Link
                    key={article.slug}
                    href={`/${article.locale}/${article.slug}`}
                    className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Cover Image */}
                    {article.coverImage && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg">
                            {t(`blog.category.${article.category}`)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Category chip if no cover image */}
                      {!article.coverImage && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg mb-3">
                          {t(`blog.category.${article.category}`)}
                        </span>
                      )}

                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {publishDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {t('blog.readingTime', { minutes: article.readingTime })}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

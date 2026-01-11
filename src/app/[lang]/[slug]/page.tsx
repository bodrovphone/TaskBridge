import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { generateCanonicalUrl } from '@/lib/utils/seo'
import { getArticleBySlug, getAllArticleSlugs, getRelatedArticles, ArticleRelatedLinks } from '@/features/blog'
import { CTASection } from '@/components/content'
import { BreadcrumbJsonLd, ArticleJsonLd, FAQJsonLd } from '@/components/seo/json-ld'
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react'

// Static generation for all articles
export const dynamic = 'force-static'

export function generateStaticParams() {
  const slugs = getAllArticleSlugs()

  return SUPPORTED_LOCALES.flatMap((lang) =>
    slugs
      .filter((s) => s.locale === lang)
      .map((s) => ({
        lang,
        slug: s.slug,
      }))
  )
}

interface ArticlePageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = validateLocale(lang) as SupportedLocale

  const article = getArticleBySlug(slug, locale)

  if (!article) {
    return {
      title: 'Not Found',
    }
  }

  // For locale-specific blog articles, only include canonical URL
  // Don't generate hreflang alternates for non-existent translations
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: {
      canonical: generateCanonicalUrl(locale, `/${slug}`),
      // No languages alternates - this article only exists in this locale
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `https://trudify.com/${locale}/${slug}`,
      siteName: 'Trudify',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      images: article.coverImage
        ? [
            {
              url: `https://trudify.com${article.coverImage}`,
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { lang, slug } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const article = getArticleBySlug(slug, locale)

  // If no article found, return 404
  if (!article) {
    notFound()
  }

  const relatedArticles = getRelatedArticles(slug, locale)

  const publishDate = new Date(article.publishedAt).toLocaleDateString(
    locale === 'bg' ? 'bg-BG' : locale === 'ru' ? 'ru-RU' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${locale}` },
          { name: article.title, url: `/${locale}/${slug}` },
        ]}
      />

      <ArticleJsonLd
        title={article.title}
        description={article.metaDescription}
        url={`/${locale}/${slug}`}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt}
        authorName={article.author}
        image={article.coverImage}
      />

      {article.faqs && article.faqs.length > 0 && <FAQJsonLd faqs={article.faqs} />}

      {/* Article Header */}
      <header className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('blog.backToBlog')}
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg">
              {t(`blog.category.${article.category}`)}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {t('blog.readingTime', { minutes: article.readingTime })}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {publishDate}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>

          {/* Author */}
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-5 h-5" />
            <span>
              {t('blog.author')}: <strong>{article.author}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 896px"
              quality={65}
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-td:border prose-td:border-gray-300 prose-td:p-3"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                {t('blog.tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="inline-block px-2 py-1 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Links / CTAs - Client component for auth support */}
          <ArticleRelatedLinks links={article.relatedLinks} />

          {/* FAQ Section */}
          {article.faqs && article.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Често задавани въпроси</h2>
              <div className="space-y-4">
                {article.faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('blog.relatedArticles')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${locale}/${related.slug}`}
                  className="block bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{related.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTASection
        title={t('blog.cta.title')}
        subtitle={t('blog.cta.subtitle')}
        primaryButton={{
          text: t('blog.cta.browseTasks'),
          href: `/${locale}/browse-tasks`,
        }}
        secondaryButton={{
          text: t('blog.cta.postTask'),
          href: `/${locale}/create-task`,
        }}
      />
    </>
  )
}

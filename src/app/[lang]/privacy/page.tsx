import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { generateAlternateLanguages, generateCanonicalUrl } from '@/lib/utils/seo'
import { Shield, AlertCircle, Mail, Building2, Hash } from 'lucide-react'
import { LocaleLink } from '@/components/common/locale-link'
import NextLink from 'next/link'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface PrivacyPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    bg: 'Политика за поверителност | Trudify',
    en: 'Privacy Policy | Trudify',
    ru: 'Политика конфиденциальности | Trudify',
    ua: 'Політика конфіденційності | Trudify',
  }

  const descriptions: Record<string, string> = {
    bg: 'Научете как Trudify събира, използва и защитава вашите лични данни съгласно GDPR.',
    en: 'Learn how Trudify collects, uses, and protects your personal data in compliance with GDPR.',
    ru: 'Узнайте, как Trudify собирает, использует и защищает ваши персональные данные в соответствии с GDPR.',
    ua: 'Дізнайтеся, як Trudify збирає, використовує та захищає ваші персональні дані відповідно до GDPR.',
  }

  return {
    title: titles[lang] || titles.bg,
    description: descriptions[lang] || descriptions.bg,
    robots: 'index, follow',
    alternates: {
      canonical: generateCanonicalUrl(lang as SupportedLocale, '/privacy'),
      languages: generateAlternateLanguages('/privacy'),
    },
  }
}

const LAST_UPDATED_DATE = '25 ноември 2025'
const LAST_UPDATED_DATE_EN = 'November 25, 2025'
const LAST_UPDATED_DATE_RU = '25 ноября 2025'
const LAST_UPDATED_DATE_UA = '25 листопада 2025'

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const lastUpdated = lang === 'en' ? LAST_UPDATED_DATE_EN
    : lang === 'ru' ? LAST_UPDATED_DATE_RU
    : lang === 'ua' ? LAST_UPDATED_DATE_UA
    : LAST_UPDATED_DATE

  // Table of contents sections
  const tocSections = [
    { id: 'section1', label: t('privacy.toc.section1') },
    { id: 'section2', label: t('privacy.toc.section2') },
    { id: 'section3', label: t('privacy.toc.section3') },
    { id: 'section4', label: t('privacy.toc.section4') },
    { id: 'section5', label: t('privacy.toc.section5') },
    { id: 'section6', label: t('privacy.toc.section6') },
    { id: 'section7', label: t('privacy.toc.section7') },
    { id: 'section8', label: t('privacy.toc.section8') },
    { id: 'section9', label: t('privacy.toc.section9') },
    { id: 'section10', label: t('privacy.toc.section10') },
    { id: 'section11', label: t('privacy.toc.section11') },
  ]

  const dataControllerLabel = lang === 'ru' ? 'Контролер данных'
    : lang === 'en' ? 'Data Controller'
    : lang === 'ua' ? 'Контролер даних'
    : 'Администратор на данни'

  const privacyContactLabel = lang === 'ru' ? 'Контакт по вопросам конфиденциальности'
    : lang === 'en' ? 'Privacy Contact'
    : lang === 'ua' ? 'Контакт з питань конфіденційності'
    : 'Контакт за поверителност'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{t('privacy.title')}</h1>
          </div>
          <p className="text-emerald-100 text-lg mb-4">{t('privacy.subtitle')}</p>
          <div className="flex flex-wrap gap-4 text-sm text-emerald-200">
            <span>{t('privacy.lastUpdated', { date: lastUpdated })}</span>
            <span>|</span>
            <span>{t('privacy.effectiveDate')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Language Notice for non-BG users */}
        {lang !== 'bg' && (
          <div className="mb-8 border border-amber-200 bg-amber-50 rounded-xl">
            <div className="flex flex-row items-start gap-4 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">
                  {t('privacy.languageNotice.title')}
                </h3>
                <p className="text-amber-700 text-sm mb-3">
                  {t('privacy.languageNotice.content')}
                </p>
                <LocaleLink
                  href="/privacy"
                  locale="bg"
                  className="inline-block px-3 py-1.5 text-sm font-medium bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  {t('privacy.languageNotice.switchToBg')}
                </LocaleLink>
              </div>
            </div>
          </div>
        )}

        {/* Company Info Card */}
        <div className="mb-8 bg-slate-50 rounded-xl border border-slate-200">
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">{dataControllerLabel}</p>
                  <p className="font-medium">{t('terms.company.name')}</p>
                  <p className="text-sm text-slate-600">{t('terms.company.eik')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">{privacyContactLabel}</p>
                  <NextLink href="mailto:support@trudify.com" className="font-medium text-emerald-600 hover:underline">
                    {t('terms.company.email')}
                  </NextLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-slate-400" />
              {t('privacy.toc.title')}
            </h2>
            <nav className="grid sm:grid-cols-2 gap-2">
              {tocSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-slate-600 hover:text-emerald-600 hover:underline transition-colors py-1"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Legal Content Sections */}
        <div className="prose prose-slate max-w-none">
          {/* Section 1 */}
          <section id="section1" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section1.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1 [&_a]:text-emerald-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: t('privacy.section1.content') }}
            />
          </section>

          {/* Section 2 */}
          <section id="section2" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section2.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section2.content') }}
            />
          </section>

          {/* Section 3 */}
          <section id="section3" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section3.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section3.content') }}
            />
          </section>

          {/* Section 4 */}
          <section id="section4" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section4.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section4.content') }}
            />
          </section>

          {/* Section 5 - Cookies */}
          <section id="section5" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section5.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section5.content') }}
            />
          </section>

          {/* Section 6 - GDPR Rights */}
          <section id="section6" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section6.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1 [&_a]:text-emerald-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: t('privacy.section6.content') }}
            />
          </section>

          {/* Section 7 */}
          <section id="section7" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section7.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section7.content') }}
            />
          </section>

          {/* Section 8 */}
          <section id="section8" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section8.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section8.content') }}
            />
          </section>

          {/* Section 9 */}
          <section id="section9" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section9.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section9.content') }}
            />
          </section>

          {/* Section 10 */}
          <section id="section10" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {t('privacy.section10.title')}
            </h2>
            <div
              className="text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: t('privacy.section10.content') }}
            />
          </section>

          {/* Section 11 - Contact */}
          <section id="section11" className="mb-10 scroll-mt-24">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {t('privacy.section11.title')}
                </h2>
                <div
                  className="text-slate-700 [&>p]:mb-3 [&>ul]:pl-6 [&>ul]:list-none [&_li]:mb-1 [&_a]:text-emerald-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: t('privacy.section11.content') }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm mb-2">{t('privacy.footer.copyright')}</p>
          <p
            className="text-slate-600 text-sm [&_a]:text-emerald-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: t('privacy.footer.termsLink') }}
          />
        </div>
      </div>
    </div>
  )
}

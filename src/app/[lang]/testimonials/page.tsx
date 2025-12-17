import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import {
  ContentPageHero,
  ContentSection,
  TestimonialCard,
  CTASection,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface TestimonialsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: TestimonialsPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('testimonials', locale, '/testimonials')
}

// Testimonial data by locale
function getTestimonials(locale: string) {
  const customerTestimonials = [
    {
      quote: locale === 'bg'
        ? 'Намерих страхотен електротехник за 24 часа. Процесът беше толкова лесен и професионалистът беше много добър.'
        : locale === 'ru'
        ? 'Нашел отличного электрика за 24 часа. Процесс был таким простым, а специалист очень профессиональным.'
        : locale === 'ua'
        ? 'Знайшов чудового електрика за 24 години. Процес був таким простим, а фахівець дуже професійним.'
        : 'Found an amazing electrician within 24 hours. The process was so easy and the professional was top-notch.',
      name: 'Maria P.',
      role: locale === 'bg' ? 'Клиент' : locale === 'ru' ? 'Клиент' : locale === 'ua' ? 'Клієнт' : 'Customer',
      location: 'Sofia',
      rating: 5,
    },
    {
      quote: locale === 'bg'
        ? 'Използвах Trudify за преместване. Получих 5 оферти за час и избрах най-добрата. Препоръчвам!'
        : locale === 'ru'
        ? 'Использовал Trudify для переезда. Получил 5 предложений за час и выбрал лучшее. Рекомендую!'
        : locale === 'ua'
        ? 'Використав Trudify для переїзду. Отримав 5 пропозицій за годину і вибрав найкращу. Рекомендую!'
        : 'Used Trudify for my move. Got 5 quotes within an hour and chose the best one. Highly recommend!',
      name: 'Ivan K.',
      role: locale === 'bg' ? 'Клиент' : locale === 'ru' ? 'Клиент' : locale === 'ua' ? 'Клієнт' : 'Customer',
      location: 'Plovdiv',
      rating: 5,
    },
    {
      quote: locale === 'bg'
        ? 'Почистващата компания, която намерих тук, е невероятна. Вече ги наемам редовно.'
        : locale === 'ru'
        ? 'Клининговая компания, которую я нашел здесь, потрясающая. Теперь нанимаю их регулярно.'
        : locale === 'ua'
        ? 'Клінінгова компанія, яку я знайшов тут, чудова. Тепер наймаю їх регулярно.'
        : 'The cleaning service I found here is amazing. I now hire them regularly.',
      name: 'Elena S.',
      role: locale === 'bg' ? 'Клиент' : locale === 'ru' ? 'Клиент' : locale === 'ua' ? 'Клієнт' : 'Customer',
      location: 'Varna',
      rating: 5,
    },
  ]

  const professionalTestimonials = [
    {
      quote: locale === 'bg'
        ? 'Trudify промени бизнеса ми. Получавам постоянни поръчки без да плащам за реклама.'
        : locale === 'ru'
        ? 'Trudify изменил мой бизнес. Получаю постоянные заказы без оплаты за рекламу.'
        : locale === 'ua'
        ? 'Trudify змінив мій бізнес. Отримую постійні замовлення без оплати за рекламу.'
        : 'Trudify changed my business. I get consistent work without paying for advertising.',
      name: 'Georgi M.',
      role: locale === 'bg' ? 'Водопроводчик' : locale === 'ru' ? 'Сантехник' : locale === 'ua' ? 'Сантехнік' : 'Plumber',
      location: 'Sofia',
      rating: 5,
    },
    {
      quote: locale === 'bg'
        ? 'Като нов в бранша, Trudify ми помогна да изградя репутация бързо. Сега имам постоянни клиенти.'
        : locale === 'ru'
        ? 'Как новичок в отрасли, Trudify помог мне быстро создать репутацию. Теперь у меня постоянные клиенты.'
        : locale === 'ua'
        ? 'Як новачок у галузі, Trudify допоміг мені швидко створити репутацію. Тепер у мене постійні клієнти.'
        : 'As a newcomer, Trudify helped me build my reputation quickly. Now I have regular clients.',
      name: 'Dimitar V.',
      role: locale === 'bg' ? 'Електротехник' : locale === 'ru' ? 'Электрик' : locale === 'ua' ? 'Електрик' : 'Electrician',
      location: 'Burgas',
      rating: 5,
    },
    {
      quote: locale === 'bg'
        ? 'Приложението е лесно за използване и клиентите са сериозни. Много съм доволна.'
        : locale === 'ru'
        ? 'Приложение простое в использовании, а клиенты серьезные. Очень довольна.'
        : locale === 'ua'
        ? 'Додаток простий у використанні, а клієнти серйозні. Дуже задоволена.'
        : 'The app is easy to use and the clients are serious. Very satisfied.',
      name: 'Anna T.',
      role: locale === 'bg' ? 'Почистване' : locale === 'ru' ? 'Уборка' : locale === 'ua' ? 'Прибирання' : 'Cleaning',
      location: 'Stara Zagora',
      rating: 5,
    },
  ]

  return { customerTestimonials, professionalTestimonials }
}

export default async function TestimonialsPage({ params }: TestimonialsPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const { customerTestimonials, professionalTestimonials } = getTestimonials(locale)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${locale}` },
          { name: t('testimonials.hero.title'), url: `/${locale}/testimonials` },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('testimonials.hero.title')}
        subtitle={t('testimonials.hero.subtitle')}
      />

      {/* Customer Testimonials */}
      <ContentSection title={t('testimonials.customers.title')} variant="default">
        <div className="grid md:grid-cols-3 gap-6">
          {customerTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              location={testimonial.location}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </ContentSection>

      {/* Professional Testimonials */}
      <ContentSection title={t('testimonials.professionals.title')} variant="gray">
        <div className="grid md:grid-cols-3 gap-6">
          {professionalTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              location={testimonial.location}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </ContentSection>

      {/* CTA */}
      <CTASection
        title={t('testimonials.cta.title')}
        subtitle={t('testimonials.cta.subtitle')}
        primaryButton={{
          text: t('about.cta.customer'),
          href: `/${locale}/create-task`,
        }}
        secondaryButton={{
          text: t('about.cta.professional'),
          href: `/${locale}/for-professionals`,
        }}
      />
    </>
  )
}

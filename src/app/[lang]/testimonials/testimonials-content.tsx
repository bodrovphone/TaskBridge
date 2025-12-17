'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  ContentPageHero,
  ContentSection,
  TestimonialCard,
  CTASection,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export default function TestimonialsContent() {
  const t = useTranslations()
  const params = useParams()
  const lang = params?.lang as string || 'bg'

  // Placeholder testimonials - replace with real ones post-launch
  const customerTestimonials = [
    {
      quote: lang === 'bg'
        ? 'Намерих страхотен електротехник за 24 часа. Процесът беше толкова лесен и професионалистът беше много добър.'
        : lang === 'ru'
        ? 'Нашел отличного электрика за 24 часа. Процесс был таким простым, а специалист очень профессиональным.'
        : 'Found an amazing electrician within 24 hours. The process was so easy and the professional was top-notch.',
      name: 'Maria P.',
      role: lang === 'bg' ? 'Клиент' : lang === 'ru' ? 'Клиент' : 'Customer',
      location: 'Sofia',
      rating: 5,
    },
    {
      quote: lang === 'bg'
        ? 'Използвах Trudify за преместване. Получих 5 оферти за час и избрах най-добрата. Препоръчвам!'
        : lang === 'ru'
        ? 'Использовал Trudify для переезда. Получил 5 предложений за час и выбрал лучшее. Рекомендую!'
        : 'Used Trudify for my move. Got 5 quotes within an hour and chose the best one. Highly recommend!',
      name: 'Ivan K.',
      role: lang === 'bg' ? 'Клиент' : lang === 'ru' ? 'Клиент' : 'Customer',
      location: 'Plovdiv',
      rating: 5,
    },
    {
      quote: lang === 'bg'
        ? 'Почистващата компания, която намерих тук, е невероятна. Вече ги наемам редовно.'
        : lang === 'ru'
        ? 'Клининговая компания, которую я нашел здесь, потрясающая. Теперь нанимаю их регулярно.'
        : 'The cleaning service I found here is amazing. I now hire them regularly.',
      name: 'Elena S.',
      role: lang === 'bg' ? 'Клиент' : lang === 'ru' ? 'Клиент' : 'Customer',
      location: 'Varna',
      rating: 5,
    },
  ]

  const professionalTestimonials = [
    {
      quote: lang === 'bg'
        ? 'Trudify промени бизнеса ми. Получавам постоянни поръчки без да плащам за реклама.'
        : lang === 'ru'
        ? 'Trudify изменил мой бизнес. Получаю постоянные заказы без оплаты за рекламу.'
        : 'Trudify changed my business. I get consistent work without paying for advertising.',
      name: 'Georgi M.',
      role: lang === 'bg' ? 'Водопроводчик' : lang === 'ru' ? 'Сантехник' : 'Plumber',
      location: 'Sofia',
      rating: 5,
    },
    {
      quote: lang === 'bg'
        ? 'Като нов в бранша, Trudify ми помогна да изградя репутация бързо. Сега имам постоянни клиенти.'
        : lang === 'ru'
        ? 'Как новичок в отрасли, Trudify помог мне быстро создать репутацию. Теперь у меня постоянные клиенты.'
        : 'As a newcomer, Trudify helped me build my reputation quickly. Now I have regular clients.',
      name: 'Dimitar V.',
      role: lang === 'bg' ? 'Електротехник' : lang === 'ru' ? 'Электрик' : 'Electrician',
      location: 'Burgas',
      rating: 5,
    },
    {
      quote: lang === 'bg'
        ? 'Приложението е лесно за използване и клиентите са сериозни. Много съм доволна.'
        : lang === 'ru'
        ? 'Приложение простое в использовании, а клиенты серьезные. Очень довольна.'
        : 'The app is easy to use and the clients are serious. Very satisfied.',
      name: 'Anna T.',
      role: lang === 'bg' ? 'Почистване' : lang === 'ru' ? 'Уборка' : 'Cleaning',
      location: 'Stara Zagora',
      rating: 5,
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${lang}` },
          { name: t('testimonials.hero.title'), url: `/${lang}/testimonials` },
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
          href: `/${lang}/create-task`,
        }}
        secondaryButton={{
          text: t('about.cta.professional'),
          href: `/${lang}/for-professionals`,
        }}
      />
    </>
  )
}

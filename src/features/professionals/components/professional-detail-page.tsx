'use client'

import { useTranslation } from 'react-i18next';
import ProfessionalHeader from './sections/professional-header';
import ActionButtonsRow from './sections/action-buttons-row';
import ServicesSection from './sections/services-section';
import PortfolioGallery from './sections/portfolio-gallery';
import ReviewsSection from './sections/reviews-section';

interface ProfessionalDetailPageProps {
  professionalId: string;
}

export default function ProfessionalDetailPage({ professionalId }: ProfessionalDetailPageProps) {
  const { t } = useTranslation();

  // Mock professional data - in real app would come from API/props
  const mockProfessional = {
    id: professionalId,
    name: "Мария Петрова",
    title: "Професионално почистване и домашни услуги", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 127,
    completedTasks: 89,
    yearsExperience: 5,
    responseTime: "2 часа",
    location: "София",
    isOnline: true,
    isVerified: {
      phone: true,
      id: true,
      address: true
    },
    bio: "Професионален домашен помощник с 5 години опит. Специализирам се в дълбоко почистване, редовно поддържане на домове и офиси. Работя с екологично чисти препарати и собствено оборудване.",
    services: [
      {
        id: "1",
        name: "Дълбоко почистване",
        price: "80-120 лв",
        description: "Цялостно почистване на дома включително прозорци"
      },
      {
        id: "2", 
        name: "Редовно почистване",
        price: "60-80 лв",
        description: "Седмично или месечно поддържане"
      }
    ],
    portfolio: [
      {
        id: "1",
        title: "Дълбоко почистване на апартамент",
        beforeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
        afterImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop"
      }
    ],
    reviews: [
      {
        id: "1",
        clientName: "Анна С.",
        rating: 5,
        comment: "Изключително доволна от услугата! Мария е много професионална и внимателна към детайлите.",
        date: "преди 1 седмица",
        verified: true,
        anonymous: false
      },
      {
        id: "2",
        clientName: "Анонимен потребител",
        rating: 5,
        comment: "Перфектно почистване! Домът изглеждаше като нов. Мария дойде с всички необходими препарати и оборудване. Препоръчвам я на 100%!",
        date: "преди 2 седмици",
        verified: true,
        anonymous: true
      },
      {
        id: "3",
        clientName: "Петър М.",
        rating: 5,
        comment: "Много сериозно отношение към работата. Дойде точно навреме, работи бързо и качествено. Ще я повиквам отново със сигурност.",
        date: "преди 3 седмици",
        verified: true,
        anonymous: false
      },
      {
        id: "4",
        clientName: "Анонимен потребител",
        rating: 4,
        comment: "Добра работа в цялост. Единственото, което бих искал е малко повече внимание към банята, но иначе съм доволен.",
        date: "преди 1 месец",
        verified: false,
        anonymous: true
      },
      {
        id: "5",
        clientName: "Елена Д.",
        rating: 5,
        comment: "Невероятна! Почисти места, които дори аз не знаех, че съществуват. Много внимателна и професионална. Благодаря!",
        date: "преди 1 месец",
        verified: true,
        anonymous: false
      },
      {
        id: "6",
        clientName: "Анонимен потребител",
        rating: 5,
        comment: "Отлично обслужване и резултат. Цената беше справедлива за качеството на услугата. Определено ще я препоръчам на приятели.",
        date: "преди 2 месеца",
        verified: true,
        anonymous: true
      },
      {
        id: "7",
        clientName: "Иван К.",
        rating: 4,
        comment: "Солидна работа. Дойде навреме, работи внимателно. Малко бавно, но крайният резултат беше много добър.",
        date: "преди 2 месеца",
        verified: true,
        anonymous: false
      }
    ],
    contactSettings: {
      allowDirectContact: true,
      preferredHours: "9:00 - 18:00",
      contactMethods: ["message", "phone"]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Professional Header */}
          <ProfessionalHeader professional={mockProfessional} />
          
          {/* Action Buttons */}
          <ActionButtonsRow 
            professional={mockProfessional}
            onProposeTask={() => console.log('Propose task clicked')}
            onContact={() => console.log('Contact clicked')}
            onAskQuestion={() => console.log('Ask question clicked')}
            onSaveToFavorites={() => console.log('Save to favorites clicked')}
          />
          
          {/* Services & About Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Services */}
            <div>
              <ServicesSection services={mockProfessional.services} />
            </div>

            {/* Right Column - About */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('professionalDetail.about')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {mockProfessional.bio}
              </p>
            </div>
          </div>

          {/* Reviews & Ratings - Centered Full Width */}
          <div id="reviews-section">
            <ReviewsSection reviews={mockProfessional.reviews} />
          </div>

          {/* Portfolio Gallery */}
          <PortfolioGallery portfolio={mockProfessional.portfolio} />
        </div>
      </div>
    </div>
  );
}
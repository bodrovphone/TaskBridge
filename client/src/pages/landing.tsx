import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CategoryCard from "@/components/category-card";
import TaskCard from "@/components/task-card";
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Truck, 
  Heart, 
  UserCheck, 
  Shield, 
  Star, 
  Lock, 
  Headphones,
  CheckCircle,
  Plus,
  Search,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const { t } = useTranslation();
  
  // Mock featured tasks for display
  const featuredTasks = [
    {
      id: "1",
      title: "Нужна помощ за разхождане на куче",
      description: "Търся някой да разходи кучето ми всеки ден от 17:00 до 18:00 часа. Кучето е средно по размер и много приятелски настроено.",
      category: "personal_care",
      budgetMin: 15,
      budgetMax: 20,
      budgetType: "fixed",
      city: "София",
      neighborhood: "Лозенец", 
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3Cfilter id='blur' x='0' y='0'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='1'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='400' height='300' fill='%23e8f5e8'/%3E%3Cg filter='url(%23blur)'%3E%3Cellipse cx='200' cy='180' rx='80' ry='40' fill='%2345a049'/%3E%3Cellipse cx='200' cy='150' rx='60' ry='30' fill='%234CAF50'/%3E%3Cellipse cx='180' cy='130' rx='15' ry='8' fill='%23388E3C'/%3E%3Cellipse cx='220' cy='135' rx='12' ry='6' fill='%23388E3C'/%3E%3Cpath d='M190 140 Q200 120 210 140' stroke='%23795548' stroke-width='3' fill='none'/%3E%3C/g%3E%3C/svg%3E",
      customer: {
        firstName: "Мария",
        lastName: "Петрова",
        averageRating: "4.8"
      }
    },
    {
      id: "2", 
      title: "Ремонт на балкон - замяна на плочки",
      description: "Балконът има нужда от ремонт. Плочките са се счупили на няколко места и трябва да се заменят. Размерът е около 6 квадратни метра.",
      category: "home_repair",
      budgetMin: 300,
      budgetMax: 500,
      budgetType: "negotiable",
      city: "Пловдив", 
      neighborhood: "Център",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3Cfilter id='blur' x='0' y='0'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='1.5'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Cg filter='url(%23blur)'%3E%3Crect x='50' y='80' width='300' height='150' fill='%23ECEFF1' stroke='%23607D8B' stroke-width='2'/%3E%3Crect x='70' y='100' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3Crect x='140' y='100' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3Crect x='210' y='100' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3Crect x='280' y='100' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3Crect x='70' y='170' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3Crect x='140' y='170' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3Crect x='210' y='170' width='50' height='50' fill='%23B0BEC5' stroke='%23455A64'/%3E%3Crect x='280' y='170' width='50' height='50' fill='%23CFD8DC' stroke='%23455A64'/%3E%3C/g%3E%3C/svg%3E",
      customer: {
        firstName: "Георги",
        lastName: "Иванов", 
        averageRating: "4.5"
      }
    },
    {
      id: "3",
      title: "Чистене на апартамент след ремонт",  
      description: "След завършване на ремонт апартаментът има нужда от задълбочено почистване. 3 стаи, кухня, баня. Около 80 кв.м.",
      category: "personal_assistant",
      budgetMin: 120,
      budgetMax: 180,
      budgetType: "fixed",
      city: "Варна",
      neighborhood: "Морска градина",
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3Cfilter id='blur' x='0' y='0'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='1.2'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='400' height='300' fill='%23fff8e1'/%3E%3Cg filter='url(%23blur)'%3E%3Crect x='100' y='100' width='200' height='120' fill='%23FFF3E0' stroke='%23E65100' stroke-width='2'/%3E%3Ccircle cx='150' cy='130' r='8' fill='%23FF9800'/%3E%3Ccircle cx='250' cy='130' r='8' fill='%23FF9800'/%3E%3Crect x='130' y='150' width='140' height='40' fill='%23FFE0B2' stroke='%23E65100'/%3E%3Cpath d='M120 190 Q200 180 280 190' stroke='%2364B5F6' stroke-width='3' fill='none'/%3E%3Ccircle cx='160' cy='180' r='6' fill='%232196F3'/%3E%3Ccircle cx='240' cy='180' r='6' fill='%232196F3'/%3E%3C/g%3E%3C/svg%3E",
      customer: {
        firstName: "Анна",
        lastName: "Стоянова",
        averageRating: "4.9"
      }
    }
  ];

  const categories = [
    {
      title: t('landing.categories.home'),
      description: t('landing.categories.home.description'),
      count: 150,
      icon: Home,
      color: "blue",
      category: "home_repair"
    },
    {
      title: t('landing.categories.tech'), 
      description: t('landing.categories.tech.description'),
      count: 85,
      icon: Truck,
      color: "green", 
      category: "delivery_transport"
    },
    {
      title: t('landing.categories.personal'),
      description: t('landing.categories.personal.description'),
      count: 65,
      icon: Heart,
      color: "purple",
      category: "personal_care"
    },
    {
      title: t('landing.categories.business'),
      description: t('landing.categories.business.description'), 
      count: 45,
      icon: UserCheck,
      color: "orange",
      category: "personal_assistant"
    },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: "Верифицирани специалисти",
      description: "Всички професионалисти преминават проверка на документи и препоръки",
      color: "bg-secondary-100 text-secondary-600"
    },
    {
      icon: Star,
      title: "Система за оценки", 
      description: "Двустранни отзиви и рейтинги за прозрачност и доверие",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Lock,
      title: "Защита на данни",
      description: "GDPR съответствие и сигурно съхранение на лична информация",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Headphones,
      title: "24/7 Поддръжка",
      description: "Винаги на разположение за помощ и решаване на проблеми", 
      color: "bg-orange-100 text-orange-600"
    },
  ];

  const customerSteps = [
    {
      step: "1",
      title: "Публикувайте задача",
      description: "Опишете задачата, качете снимки, определете бюджет и срок за изпълнение"
    },
    {
      step: "2", 
      title: "Получете предложения",
      description: "Проверени специалисти ще кандидатстват с цени и срокове за вашата задача"
    },
    {
      step: "3",
      title: "Изберете и оценете", 
      description: "Свържете се директно със специалиста и оценете работата след завършване"
    },
  ];

  const professionalSteps = [
    {
      step: "1",
      title: "Регистрирайте се",
      description: "Създайте профил, верифицирайте се и изберете категории услуги"
    },
    {
      step: "2",
      title: "Кандидатствайте", 
      description: "Разгледайте задачи, изпратете предложения с цени и срокове"
    },
    {
      step: "3",
      title: "Работете и печелете",
      description: "Изпълнете задачата качествено и изградете своята репутация"
    },
  ];

  const handleCategoryClick = (category: string) => {
    window.location.href = `/browse-tasks?category=${category}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {t('landing.hero.title')}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {t('landing.hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-4 h-auto"
                  asChild
                >
                  <a href="/api/login">
                    <Plus className="mr-2" size={20} />
                    {t('landing.hero.getStarted')}
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 text-lg px-8 py-4 h-auto"
                  asChild
                >
                  <a href="/browse-tasks">  
                    <Search className="mr-2" size={20} />
                    {t('landing.hero.browseServices')}
                  </a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{t('landing.trustIndicators.verified')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{t('landing.trustIndicators.securePayments')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{t('landing.trustIndicators.support')}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Hero Image */}
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional plumber working on home repairs" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Star className="text-secondary-600" size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">4.8</div>
                    <div className="text-xs text-gray-500">{t('landing.stats.averageRating')}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">2,500+</div>
                    <div className="text-xs text-gray-500">{t('landing.stats.completedTasks')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('landing.categories.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.categories.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.category}
                title={category.title}
                description={category.description}
                count={category.count}
                icon={category.icon}
                color={category.color}
                onClick={() => handleCategoryClick(category.category)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="ghost" className="text-primary-600 hover:text-primary-700 font-semibold text-lg">
              {t('landing.categories.viewAll')} <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('landing.howItWorks.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          {/* For Customers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">{t('landing.howItWorks.forCustomers')}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {customerSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary-600">{step.step}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* For Professionals */}
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">{t('landing.howItWorks.forProfessionals')}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {professionalSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-secondary-600">{step.step}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section id="browse-tasks" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{t('landing.featured.title')}</h2>
              <p className="text-xl text-gray-600">{t('landing.featured.subtitle')}</p>
            </div>
            <Button 
              className="bg-primary-500 hover:bg-primary-600"
              asChild
            >
              <a href="/browse-tasks">Виж всички задачи</a>
            </Button>
          </div>

          {featuredTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTasks.slice(0, 3).map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  showApplyButton={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Няма налични задачи в момента.</p>
              <Button className="mt-4 bg-primary-500 hover:bg-primary-600" asChild>
                <a href="/api/login">Публикувай първата задача</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Verification */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Сигурност и доверие</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Платформата осигурява безопасна среда за всички потребители
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Professionals CTA */}
      <section id="for-professionals" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 lg:p-12 text-white">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  {t('landing.forProfessionals.title')}
                </h2>
                <p className="text-xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
                  {t('landing.forProfessionals.description')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                      <Plus className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">{t('landing.forProfessionals.postTask')}</h3>
                    <p className="text-primary-100">{t('landing.forProfessionals.postTaskDesc')}</p>
                    <Button 
                      size="lg"
                      className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 h-auto w-full"
                      asChild
                    >
                      <a href="/create-task">{t('landing.forProfessionals.postTask')}</a>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                      <UserCheck className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">{t('landing.forProfessionals.becomePro')}</h3>
                    <p className="text-primary-100">{t('landing.forProfessionals.becomeProDesc')}</p>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 h-auto w-full"
                      asChild
                    >
                      <a href="/api/login">{t('landing.forProfessionals.becomePro')}</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

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
  FileText,
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
      title: t('mockTask.dogWalking.title'),
      description: t('mockTask.dogWalking.description'),
      category: "personal_care",
      budgetMin: 15,
      budgetMax: 20,
      budgetType: "fixed",
      city: "София",
      neighborhood: "Лозенец", 
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),

      customer: {
        firstName: "Мария",
        lastName: "Петрова",
        averageRating: "4.8"
      }
    },
    {
      id: "2", 
      title: t('mockTask.balconyRepair.title'),
      description: t('mockTask.balconyRepair.description'),
      category: "home_repair",
      budgetMin: 300,
      budgetMax: 500,
      budgetType: "negotiable",
      city: "Пловдив", 
      neighborhood: "Център",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),

      customer: {
        firstName: "Георги",
        lastName: "Иванов", 
        averageRating: "4.5"
      }
    },
    {
      id: "3",
      title: t('mockTask.apartmentCleaning.title'),  
      description: t('mockTask.apartmentCleaning.description'),
      category: "personal_assistant",
      budgetMin: 120,
      budgetMax: 180,
      budgetType: "fixed",
      city: "Варна",
      neighborhood: "Морска градина",
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),

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
      title: t('landing.trustIndicators.verified'),
      description: t('landing.trustIndicators.verifiedDescription'),
      color: "bg-secondary-100 text-secondary-600",
      stat: "99.9%",
      statLabel: t('landing.trustStats.securityUptime')
    },
    {
      icon: Star,
      title: t('landing.trustIndicators.ratingSystem'),
      description: t('landing.trustIndicators.ratingSystemDescription'),
      color: "bg-blue-100 text-blue-600",
      stat: "4.8/5",
      statLabel: t('landing.trustStats.avgRating')
    },
    {
      icon: Lock,
      title: t('landing.trustIndicators.dataProtection'),
      description: t('landing.trustIndicators.dataProtectionDescription'),
      color: "bg-green-100 text-green-600",
      stat: "256-bit",
      statLabel: t('landing.trustStats.encryption')
    },
    {
      icon: FileText,
      title: t('landing.trustIndicators.contracts'),
      description: t('landing.trustIndicators.contractsDescription'), 
      color: "bg-orange-100 text-orange-600",
      stat: "GDPR",
      statLabel: t('landing.trustStats.compliance')
    },
  ];

  const customerSteps = [
    {
      step: "1",
      title: t('landing.howItWorks.customers.step1.title'),
      description: t('landing.howItWorks.customers.step1.description')
    },
    {
      step: "2", 
      title: t('landing.howItWorks.customers.step2.title'),
      description: t('landing.howItWorks.customers.step2.description')
    },
    {
      step: "3",
      title: t('landing.howItWorks.customers.step3.title'), 
      description: t('landing.howItWorks.customers.step3.description')
    },
  ];

  const professionalSteps = [
    {
      step: "1",
      title: t('landing.howItWorks.professionals.step1.title'),
      description: t('landing.howItWorks.professionals.step1.description')
    },
    {
      step: "2",
      title: t('landing.howItWorks.professionals.step2.title'), 
      description: t('landing.howItWorks.professionals.step2.description')
    },
    {
      step: "3",
      title: t('landing.howItWorks.professionals.step3.title'),
      description: t('landing.howItWorks.professionals.step3.description')
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
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {featuredTasks.map((task: any) => (
                  <div key={task.id} className="flex-shrink-0 w-80">
                    <TaskCard 
                      task={task} 
                      showApplyButton={false}
                    />
                  </div>
                ))}
              </div>
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
      <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Shield size={32} className="text-primary-600" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('landing.trustSection.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('landing.trustSection.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature, index) => (
              <div key={feature.title} className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100/50 backdrop-blur-sm h-full flex flex-col">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed flex-grow mb-6">{feature.description}</p>
                  
                  {/* Individual stat for each card */}
                  <div className="text-center mt-auto">
                    <div className="text-2xl font-bold text-primary-600">{feature.stat}</div>
                    <div className="text-sm text-gray-500">{feature.statLabel}</div>
                  </div>
                  
                  {/* Feature number badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">{t('landing.testimonials.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          {/* Customer Testimonials */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('landing.testimonials.customers.title')}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy customer"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer1.name')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer1.location')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer1.quote')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy customer"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer2.name')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer2.location')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer2.quote')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} fill="currentColor" className="opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy customer"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer3.name')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer3.location')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer3.quote')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} fill="currentColor" className="opacity-75" />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Testimonials */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('landing.testimonials.professionals.title')}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy professional"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro1.name')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro1.profession')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro1.quote')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} fill="currentColor" className="opacity-60" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy professional"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro2.name')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro2.profession')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro2.quote')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy professional"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro3.name')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro3.profession')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro3.quote')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} fill="currentColor" className="opacity-40" />
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-8 lg:p-16 border border-gray-700">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary-500 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-6 shadow-lg">
                <Handshake className="text-white" size={32} />
              </div>
              
              <h3 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                {t('landing.cta.title')}
              </h3>
              <p className="text-xl lg:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
                {t('landing.cta.subtitle')}
              </p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
                <div className="text-center bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-3xl lg:text-4xl font-bold mb-2 text-white">2,500+</div>
                  <div className="text-gray-300 text-sm lg:text-base font-medium">{t('landing.cta.stats.completedTasks')}</div>
                </div>
                <div className="text-center bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-3xl lg:text-4xl font-bold mb-2 text-white">850+</div>
                  <div className="text-gray-300 text-sm lg:text-base font-medium">{t('landing.cta.stats.activeSpecialists')}</div>
                </div>
                <div className="text-center bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-3xl lg:text-4xl font-bold mb-2 text-yellow-400">4.8★</div>
                  <div className="text-gray-300 text-sm lg:text-base font-medium">{t('landing.cta.stats.averageRating')}</div>
                </div>
                <div className="text-center bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-3xl lg:text-4xl font-bold mb-2 text-blue-400">50+</div>
                  <div className="text-gray-300 text-sm lg:text-base font-medium">{t('landing.cta.stats.contractTemplates')}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold shadow-xl"
                  asChild
                >
                  <a href="/create-task" className="flex items-center gap-2">
                    <Plus size={20} />
                    {t('landing.cta.postTask')}
                  </a>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold"
                  asChild
                >
                  <a href="/api/login" className="flex items-center gap-2">
                    <UserCheck size={20} />
                    {t('landing.cta.joinProfessionals')}
                  </a>
                </Button>
              </div>
              
              <p className="text-gray-400 text-sm mt-6 font-medium">
                {t('landing.cta.freeToJoin')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

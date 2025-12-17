'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button, Card, CardBody, Chip } from '@nextui-org/react'
import {
  Gift,
  Trophy,
  Star,
  Sparkles,
  CheckCircle,
  Calendar,
  Users,
  Zap,
  ArrowRight,
  Clock,
  Briefcase,
  Wallet,
  TrendingUp,
  Shield,
  Target,
  Award,
} from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { motion } from 'framer-motion'
import { SocialLinks } from '@/components/ui/social-icons'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Prize Card Component
function PrizeCard({
  rank,
  amount,
  icon: Icon,
  color,
  delay = 0,
}: {
  rank: string
  amount: string
  icon: React.ElementType
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={`relative overflow-hidden border-2 ${color} hover:scale-105 transition-transform duration-300`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
        <CardBody className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/90 shadow-lg mb-4 mx-auto">
            <Icon className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
            {rank}
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            {amount}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

// How It Works Step
function HowItWorksStep({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

// Benefit Card Component
function BenefitCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 mb-4">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  )
}

export default function GiveawayContent() {
  const t = useTranslations()
  const params = useParams()
  const lang = (params?.lang as string) || 'bg'

  const prizeDistribution = [
    { rank: t('giveaway.prizes.grand'), amount: '50 EUR', icon: Trophy, color: 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100' },
    { rank: t('giveaway.prizes.second'), amount: '40 EUR', icon: Star, color: 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100' },
    { rank: t('giveaway.prizes.third'), amount: '30 EUR', icon: Gift, color: 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100' },
  ]

  const howItWorks = [
    {
      title: t('giveaway.howItWorks.step1.title'),
      description: t('giveaway.howItWorks.step1.description'),
      icon: Users,
    },
    {
      title: t('giveaway.howItWorks.step2.title'),
      description: t('giveaway.howItWorks.step2.description'),
      icon: Zap,
    },
    {
      title: t('giveaway.howItWorks.step3.title'),
      description: t('giveaway.howItWorks.step3.description'),
      icon: Gift,
    },
  ]

  const rules = [
    t('giveaway.rules.rule1'),
    t('giveaway.rules.rule2'),
    t('giveaway.rules.rule3'),
    t('giveaway.rules.rule4'),
  ]

  const benefitsProfessionals = [
    {
      title: t('giveaway.benefits.professionals.findWork.title'),
      description: t('giveaway.benefits.professionals.findWork.description'),
      icon: Briefcase,
    },
    {
      title: t('giveaway.benefits.professionals.earnMoney.title'),
      description: t('giveaway.benefits.professionals.earnMoney.description'),
      icon: Wallet,
    },
    {
      title: t('giveaway.benefits.professionals.growBusiness.title'),
      description: t('giveaway.benefits.professionals.growBusiness.description'),
      icon: TrendingUp,
    },
    {
      title: t('giveaway.benefits.professionals.bonusRewards.title'),
      description: t('giveaway.benefits.professionals.bonusRewards.description'),
      icon: Award,
    },
  ]

  const benefitsCustomers = [
    {
      title: t('giveaway.benefits.customers.fastHelp.title'),
      description: t('giveaway.benefits.customers.fastHelp.description'),
      icon: Zap,
    },
    {
      title: t('giveaway.benefits.customers.verified.title'),
      description: t('giveaway.benefits.customers.verified.description'),
      icon: Shield,
    },
    {
      title: t('giveaway.benefits.customers.fairPrices.title'),
      description: t('giveaway.benefits.customers.fairPrices.description'),
      icon: Target,
    },
    {
      title: t('giveaway.benefits.customers.winPrizes.title'),
      description: t('giveaway.benefits.customers.winPrizes.description'),
      icon: Gift,
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${lang}` },
          { name: t('giveaway.hero.title'), url: `/${lang}/giveaway` },
        ]}
      />

      {/* Hero Section - Extra Stylish */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white/10 blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-yellow-400/20 blur-2xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-1/4 w-16 h-16 rounded-full bg-pink-400/20 blur-xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Chip
              startContent={<Sparkles className="w-4 h-4" />}
              className="bg-white/20 text-white border-white/30 mb-6"
              variant="bordered"
            >
              {t('giveaway.hero.badge')}
            </Chip>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('giveaway.hero.title')}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('giveaway.hero.subtitle')}
          </motion.p>

          <motion.p
            className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {t('giveaway.hero.subtitleExtra')}
          </motion.p>

          {/* Prize Pool Highlight */}
          <motion.div
            className="inline-flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4 border border-white/20 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Trophy className="w-8 h-8 text-amber-400" />
            <div className="text-left">
              <div className="text-white/70 text-sm">{t('giveaway.hero.totalPrizes')}</div>
              <div className="text-3xl font-bold text-white">{t('giveaway.hero.prizeCount')}</div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              as={Link}
              href={`/${lang}/browse-tasks`}
              size="lg"
              className="bg-white text-indigo-600 font-bold hover:bg-white/90 shadow-xl"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {t('giveaway.hero.ctaProfessional')}
            </Button>
            <Button
              as={Link}
              href={`/${lang}/create-task`}
              size="lg"
              variant="bordered"
              className="border-white/50 text-white hover:bg-white/10 font-semibold"
            >
              {t('giveaway.hero.ctaCustomer')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SEO Keywords Section - Why Trudify */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('giveaway.whyTrudify.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('giveaway.whyTrudify.subtitle')}
            </p>
          </motion.div>

          {/* For Professionals */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('giveaway.benefits.professionals.title')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefitsProfessionals.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  title={benefit.title}
                  description={benefit.description}
                  icon={benefit.icon}
                />
              ))}
            </div>
          </motion.div>

          {/* For Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('giveaway.benefits.customers.title')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefitsCustomers.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  title={benefit.title}
                  description={benefit.description}
                  icon={benefit.icon}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Draw Section */}
      <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-amber-700 font-medium">{t('giveaway.nextDraw.label')}</div>
                <div className="text-2xl font-bold text-gray-900">{t('giveaway.nextDraw.date')}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-amber-700 font-medium">{t('giveaway.nextDraw.frequency')}</div>
                <div className="text-2xl font-bold text-gray-900">{t('giveaway.nextDraw.frequencyValue')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('giveaway.prizes.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('giveaway.prizes.subtitle')}
            </p>
          </motion.div>

          {/* Top 3 Prizes */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {prizeDistribution.map((prize, index) => (
              <PrizeCard
                key={index}
                rank={prize.rank}
                amount={prize.amount}
                icon={prize.icon}
                color={prize.color}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Additional Prizes */}
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardBody className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Gift key={i} className="w-5 h-5 text-blue-500" />
                  ))}
                </div>
                <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  {t('giveaway.prizes.remaining')}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {t('giveaway.prizes.remainingValue')}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Sponsor Note */}
          <motion.p
            className="text-center text-gray-500 mt-8 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('giveaway.prizes.sponsorNote')}
          </motion.p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('giveaway.howItWorks.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('giveaway.howItWorks.subtitle')}
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {howItWorks.map((step, index) => (
              <HowItWorksStep
                key={index}
                number={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('giveaway.seo.title')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {t('giveaway.seo.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {t('giveaway.seo.paragraph2')}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('giveaway.seo.paragraph3')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('giveaway.rules.title')}
            </h2>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ul className="space-y-4">
              {rules.map((rule, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{rule}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Social Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('footer.social.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('footer.social.followUs')}
            </p>
            <div className="flex justify-center">
              <SocialLinks variant="colored" iconSize={24} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('giveaway.cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('giveaway.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                href={`/${lang}/profile/professional`}
                size="lg"
                className="bg-white text-indigo-600 font-bold hover:bg-white/90 shadow-xl"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                {t('giveaway.cta.joinProfessional')}
              </Button>
              <Button
                as={Link}
                href={`/${lang}/create-task`}
                size="lg"
                variant="bordered"
                className="border-white/50 text-white hover:bg-white/10 font-semibold"
              >
                {t('giveaway.cta.postTask')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

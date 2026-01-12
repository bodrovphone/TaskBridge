'use client'

import { motion } from 'framer-motion'
import { Card, CardBody, Button, Divider } from '@heroui/react'
import { CheckCircle, Star, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CompletionSuccessViewProps {
  professionalName: string
  onLeaveReview: () => void
  onViewDetails: () => void
  className?: string
}

export function CompletionSuccessView({
  professionalName,
  onLeaveReview,
  onViewDetails,
  className = ''
}: CompletionSuccessViewProps) {
  const t = useTranslations()

  return (
    <Card className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-2xl ${className}`}>
      <CardBody className="p-6 md:p-8">
        <div className="text-center space-y-6">
          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              duration: 0.6
            }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5
                }}
                className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-50"
              />
              <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl">
                <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          {/* Success Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-2">
              {t('taskCompletion.success.title')}
            </h2>
            <p className="text-lg text-green-700">
              {t('taskCompletion.success.message')}
            </p>
          </motion.div>

          <Divider className="bg-green-200" />

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-green-900">
              {t('taskCompletion.success.nextSteps')}
            </h3>

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">1. {t('taskCompletion.success.step1')}</p>
                  <p className="text-sm text-gray-600">{t('taskCompletion.success.step1Description', { name: professionalName })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">2. {t('taskCompletion.success.step2')}</p>
                  <p className="text-sm text-gray-600">{t('taskCompletion.success.step2Description')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
          >
            <Button
              size="lg"
              color="warning"
              variant="shadow"
              startContent={<Star className="w-5 h-5" />}
              onPress={onLeaveReview}
              className="font-semibold"
            >
              {t('taskCompletion.success.leaveReview')}
            </Button>

            <Button
              size="lg"
              variant="bordered"
              startContent={<FileText className="w-5 h-5" />}
              onPress={onViewDetails}
            >
              {t('taskCompletion.success.viewDetails')}
            </Button>
          </motion.div>

          {/* Confetti-like decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 0 }}
                animate={{
                  y: [null, 20],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 2,
                  ease: 'easeOut'
                }}
                className="absolute"
                style={{
                  left: `${10 + i * 15}%`,
                  top: '10%'
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    i % 3 === 0 ? 'bg-green-400' : i % 3 === 1 ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </CardBody>
    </Card>
  )
}

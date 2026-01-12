'use client'

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Card as NextUICard, Button as NextUIButton } from "@heroui/react";
import { Sparkles, Lightbulb, Plus } from "lucide-react";
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { DEFAULT_LOCALE } from '@/lib/constants/locales';
import { useCreateTask } from '@/hooks/use-create-task';
import { ReviewEnforcementDialog } from '@/features/reviews';

/**
 * Empty state component for when user has no posted tasks
 * Encourages users to create their first task with a friendly, creative design
 */
export default function EmptyPostedTasks() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = extractLocaleFromPathname(pathname) || DEFAULT_LOCALE;

  const {
    handleCreateTask,
    showEnforcementDialog,
    setShowEnforcementDialog,
    blockType,
    blockingTasks,
    handleReviewTask
  } = useCreateTask();

  return (
    <NextUICard className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl border-2 border-blue-200">
      <div className="p-12 text-center">
        {/* Animated lightbulb with sparkles */}
        <div className="relative inline-block mb-6">
          {/* Main lightbulb animation */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{
              scale: 1,
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              scale: { type: "spring", bounce: 0.6, duration: 0.8 },
              rotate: {
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
                repeatDelay: 1
              }
            }}
            className="text-amber-500 relative z-10"
          >
            <Lightbulb size={64} className="mx-auto" strokeWidth={2} fill="currentColor" />
          </motion.div>

          {/* Sparkle animations around the lightbulb */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (index - 1) * 30, (index - 1) * 40],
                y: [0, -20 - index * 10, -30 - index * 15],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.4,
                ease: "easeOut"
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2"
            >
              <Sparkles size={20} className="text-yellow-400" />
            </motion.div>
          ))}
        </div>

        {/* Friendly title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-3"
        >
          {t('postedTasks.empty.title')}
        </motion.h3>

        {/* Encouraging description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-700 text-lg mb-2 max-w-md mx-auto"
        >
          {t('postedTasks.empty.description')}
        </motion.p>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-sm mb-8 max-w-lg mx-auto"
        >
          {t('postedTasks.empty.subtext')}
        </motion.p>

        {/* Call to action button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.6,
            type: "spring",
            bounce: 0.5
          }}
        >
          <NextUIButton
            color="primary"
            variant="shadow"
            size="lg"
            onClick={handleCreateTask}
            startContent={<Plus size={24} strokeWidth={2.5} />}
            className="font-bold text-lg px-8 py-6 h-auto"
          >
            {t('postedTasks.empty.createButton')}
          </NextUIButton>
        </motion.div>

        {/* Additional helpful text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-400 text-xs mt-6"
        >
          {t('postedTasks.empty.hint')}
        </motion.p>
      </div>

      {/* Review Enforcement Dialog */}
      <ReviewEnforcementDialog
        isOpen={showEnforcementDialog}
        onClose={() => setShowEnforcementDialog(false)}
        blockType={blockType}
        pendingTasks={blockingTasks}
        onReviewTask={handleReviewTask}
      />
    </NextUICard>
  );
}

'use client'

import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Home, Search, PlusCircle, Palmtree } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'bg';

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Animated vacation icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{
            scale: 1,
            rotate: [0, -5, 5, -5, 0],
          }}
          transition={{
            scale: { type: "spring", bounce: 0.6 },
            rotate: {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }
          }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
              <Palmtree className="w-16 h-16 text-green-600" strokeWidth={1.5} />
            </div>
            {/* 404 badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg shadow-md"
            >
              404
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          {t('error.404.title')}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-lg mb-2"
        >
          {t('error.404.description')}
        </motion.p>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-sm mb-8"
        >
          {t('error.404.subtext')}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 justify-center items-center"
        >
          <Button
            size="lg"
            startContent={<Home className="w-5 h-5 flex-shrink-0" />}
            onClick={() => router.push(`/${locale}`)}
            className="font-semibold bg-blue-500 text-white shadow-lg shadow-blue-500/30 min-w-[160px]"
          >
            {t('error.404.goHome')}
          </Button>
          <Button
            size="lg"
            startContent={<Search className="w-5 h-5 flex-shrink-0" />}
            onClick={() => router.push(`/${locale}/browse-tasks`)}
            className="font-semibold bg-green-500 text-white shadow-lg shadow-green-500/30 min-w-[160px]"
          >
            {t('error.404.browseTasks')}
          </Button>
          <Button
            size="lg"
            startContent={<PlusCircle className="w-5 h-5 flex-shrink-0" />}
            onClick={() => router.push(`/${locale}/create-task`)}
            className="font-semibold bg-amber-500 text-white shadow-lg shadow-amber-500/30 min-w-[160px]"
          >
            {t('error.404.createTask')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

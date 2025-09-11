'use client'

import { useState } from "react";
import { User, MessageCircle, Share2 } from "lucide-react";
import { Button as NextUIButton, Card as NextUICard, CardBody } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import AuthSlideOver from "@/components/ui/auth-slide-over";

export default function TaskActions() {
  const { t } = useTranslation();
  const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'apply' | 'question' | null>(null);

  const handleAuthAction = (action: 'apply' | 'question') => {
    setAuthAction(action);
    setIsAuthSlideOverOpen(true);
  };

  return (
    <>
      <NextUICard className="bg-white/95 backdrop-blur-sm shadow-lg">
        <CardBody className="p-6 space-y-3">
          <NextUIButton
            color="primary"
            size="lg"
            className="w-full font-semibold"
            startContent={<User size={20} />}
            onPress={() => handleAuthAction('apply')}
          >
            {t('taskDetail.apply')}
          </NextUIButton>
          
          <NextUIButton
            variant="bordered"
            size="lg"
            className="w-full"
            startContent={<MessageCircle size={20} />}
            onPress={() => handleAuthAction('question')}
          >
            {t('taskDetail.askQuestion')}
          </NextUIButton>
          
          <NextUIButton
            variant="light"
            size="lg"
            className="w-full"
            startContent={<Share2 size={20} />}
          >
            {t('taskDetail.share')}
          </NextUIButton>
        </CardBody>
      </NextUICard>

      <AuthSlideOver 
        isOpen={isAuthSlideOverOpen}
        onClose={() => setIsAuthSlideOverOpen(false)}
        action={authAction}
      />
    </>
  );
}
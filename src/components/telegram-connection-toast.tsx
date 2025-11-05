'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

const TELEGRAM_TOAST_DISMISSED_KEY = 'telegram-toast-dismissed';
const TOAST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function TelegramConnectionToast() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    const checkAndShowToast = async () => {
      // Only show once per session
      if (hasShownToast) return;

      // Check if toast was recently dismissed
      const dismissedTimestamp = localStorage.getItem(TELEGRAM_TOAST_DISMISSED_KEY);
      if (dismissedTimestamp) {
        const timeSinceDismissed = Date.now() - parseInt(dismissedTimestamp, 10);
        if (timeSinceDismissed < TOAST_COOLDOWN_MS) {
          return; // Don't show if dismissed within last 24 hours
        }
      }

      // Check if user is logged in and Telegram not connected
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return; // User not logged in

      // Check if user has Telegram connected
      const { data: userData } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('id', user.id)
        .single();

      if (userData?.telegram_id) return; // Telegram already connected

      // Show the toast
      setHasShownToast(true);

      const currentLocale = i18n.language || 'en';

      const toastInstance = toast({
        duration: 10000, // Show for 10 seconds
        className: 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white p-4',
        hideIcon: true, // Hide default info icon
        title: (
          <div className="flex items-center gap-2">
            <Image
              src="/icons/telegram-logo.svg"
              alt="Telegram"
              width={24}
              height={24}
            />
            <span>{t('profile.telegram.toast.title')}</span>
          </div>
        ),
        description: (
          <div className="space-y-3 mt-2">
            <p className="text-sm text-gray-700">
              {t('profile.telegram.toast.description')}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex-1"
                onClick={() => {
                  // Mark as dismissed
                  localStorage.setItem(TELEGRAM_TOAST_DISMISSED_KEY, Date.now().toString());
                  // Dismiss the toast immediately
                  toastInstance.dismiss();
                  // Navigate to profile with settings hash
                  router.push(`/${currentLocale}/profile?openSettings=telegram`);
                }}
              >
                {t('profile.telegram.toast.action')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700 font-medium"
                onClick={() => {
                  // Mark as dismissed
                  localStorage.setItem(TELEGRAM_TOAST_DISMISSED_KEY, Date.now().toString());
                  // Dismiss the toast
                  toastInstance.dismiss();
                }}
              >
                {t('ignore')}
              </Button>
            </div>
          </div>
        ),
        onOpenChange: (open) => {
          // If toast is closed (dismissed), save timestamp
          if (!open) {
            localStorage.setItem(TELEGRAM_TOAST_DISMISSED_KEY, Date.now().toString());
          }
        }
      });
    };

    // Small delay to ensure i18n is ready
    const timeoutId = setTimeout(() => {
      checkAndShowToast();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [hasShownToast, t, i18n.language, router]);

  return null; // This component doesn't render anything
}

'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Chip, Divider, Input } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/features/auth';

interface TelegramConnectionProps {
  userId: string;
  telegramConnected: boolean;
  telegramUsername?: string | null;
  telegramFirstName?: string | null;
  onConnectionChange?: () => void; // Callback to notify parent of connection state change
}

export function TelegramConnection({
  userId,
  telegramConnected,
  telegramUsername,
  telegramFirstName,
  onConnectionChange
}: TelegramConnectionProps) {
  const { t, i18n } = useTranslation();
  const { authenticatedFetch } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleOpenBot = () => {
    // Get current app locale and pass it to the bot via start parameter
    const locale = i18n.language || 'bg';
    const botLink = `https://t.me/Trudify_bot?start=${locale}`;
    window.open(botLink, '_blank');

    // Show the input field and instructions
    setShowInstructions(true);
    setError(null);
  };

  const handleConnect = async () => {
    if (!telegramId || telegramId.trim() === '') {
      setError(t('profile.telegram.invalidIdFormat'));
      return;
    }

    // Validate it's a number
    if (!/^\d+$/.test(telegramId)) {
      setError(t('profile.telegram.invalidIdFormat'));
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get current app locale from i18next
      const locale = i18n.language || 'bg';

      const response = await authenticatedFetch('/api/telegram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId, userId, locale })
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate telegram_id error
        if (response.status === 409) {
          setError(t('profile.telegram.alreadyConnected'));
        } else {
          setError(errorData.error || t('profile.telegramConnectError'));
        }
        return;
      }

      // Success! Notify parent and reset UI
      setShowInstructions(false);
      setTelegramId('');
      setError(null);

      // Notify parent component to refresh profile data
      if (onConnectionChange) {
        onConnectionChange();
      }
    } catch (err) {
      console.error('Error connecting Telegram:', err);
      setError(err instanceof Error ? err.message : t('profile.telegramConnectError'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(t('profile.telegramDisconnectConfirm'))) {
      return;
    }

    setIsDisconnecting(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Telegram');
      }

      // Notify parent component to refresh profile data
      if (onConnectionChange) {
        onConnectionChange();
      }
    } catch (err) {
      console.error('Error disconnecting Telegram:', err);
      setError(t('profile.telegramDisconnectError'));
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100">
            <Image
              src="/icons/telegram-logo.svg"
              alt="Telegram"
              width={20}
              height={20}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">{t('profile.telegramNotifications')}</h3>
              {telegramConnected ? (
                <Chip
                  color="success"
                  variant="flat"
                  startContent={<CheckCircle2 className="w-3 h-3" />}
                  size="sm"
                >
                  {t('profile.connected')}
                </Chip>
              ) : (
                <Chip
                  color="default"
                  variant="flat"
                  startContent={<XCircle className="w-3 h-3" />}
                  size="sm"
                >
                  {t('profile.notConnected')}
                </Chip>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {t('profile.telegramDescription')}
            </p>
          </div>
        </div>

        {telegramConnected && (telegramUsername || telegramFirstName) && (
          <>
            <Divider className="my-3" />
            <div className="text-sm text-gray-600 mb-3">
              {t('profile.connectedAs')}: <strong>
                {telegramUsername ? `@${telegramUsername}` : telegramFirstName}
              </strong>
            </div>
          </>
        )}

        {!telegramConnected && !showInstructions && (
          <>
            <Divider className="my-3" />
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {t('profile.benefits')}:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('profile.instantNotifications')}</li>
                <li>• {t('profile.freeForever')}</li>
                <li>• {t('profile.noEmailSpam')}</li>
                <li>• {t('profile.richMessages')}</li>
              </ul>
            </div>
          </>
        )}

        {!telegramConnected && showInstructions && (
          <>
            <Divider className="my-3" />
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {t('profile.telegram.steps')}:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    {t('profile.telegram.step1')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    {t('profile.telegram.step2')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    {t('profile.telegram.step3')}
                  </p>
                </div>
              </div>

              <Input
                type="text"
                label={t('profile.telegram.enterId')}
                placeholder="5108679736"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ''))}
                size="lg"
                className="mb-3"
                classNames={{
                  input: 'text-center text-xl font-bold tracking-wide'
                }}
              />

              <Button
                color="primary"
                size="lg"
                fullWidth
                onPress={handleConnect}
                isLoading={isConnecting}
                isDisabled={!telegramId || telegramId.trim() === ''}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
              >
                {t('profile.telegram.connect')}
              </Button>
            </div>
          </>
        )}

        {error && (
          <>
            <Divider className="my-3" />
            <div className="text-sm text-danger bg-danger-50 p-3 rounded-lg mb-3">
              {error}
            </div>
          </>
        )}

        <Divider className="my-3" />

        {telegramConnected ? (
          <Button
            color="danger"
            variant="flat"
            size="sm"
            onPress={handleDisconnect}
            isLoading={isDisconnecting}
            fullWidth
          >
            {t('profile.disconnectTelegram')}
          </Button>
        ) : !showInstructions ? (
          <Button
            size="lg"
            variant="flat"
            color="primary"
            fullWidth
            startContent={
              <Image
                src="/icons/telegram-logo.svg"
                alt="Telegram"
                width={20}
                height={20}
              />
            }
            onPress={handleOpenBot}
            className="hover:scale-105 transition-transform shadow-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          >
            {t('profile.telegram.openBot')}
          </Button>
        ) : (
          <Button
            variant="flat"
            size="sm"
            fullWidth
            onPress={() => setShowInstructions(false)}
          >
            {t('common.cancel')}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

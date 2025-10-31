'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Chip, Divider } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, CheckCircle2, XCircle } from 'lucide-react';

interface TelegramConnectionProps {
  userId: string;
  telegramConnected: boolean;
  telegramUsername?: string | null;
  telegramFirstName?: string | null;
}

export function TelegramConnection({
  userId,
  telegramConnected,
  telegramUsername,
  telegramFirstName
}: TelegramConnectionProps) {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Generate connection token
      const response = await fetch('/api/telegram/generate-connection-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token generation failed:', errorData);

        // Show helpful message for development
        if (errorData.error === 'User not found') {
          throw new Error('Development Mode: Mock user not found in database. This feature requires real authentication.');
        }

        throw new Error(errorData.error || 'Failed to generate connection token');
      }

      const { token } = await response.json();

      // Open Telegram with deep link
      const deepLink = `https://t.me/Trudify_bot?start=connect_${token}`;
      window.open(deepLink, '_blank');

      // Show instructions
      alert(t('profile.telegramInstructions'));
    } catch (err) {
      console.error('Error connecting Telegram:', err);
      setError(t('profile.telegramConnectError'));
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
      const response = await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Telegram');
      }

      // Reload to show updated status
      window.location.reload();
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
            <MessageCircle className="w-5 h-5 text-blue-600" />
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

        {!telegramConnected && (
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
        ) : (
          <Button
            color="primary"
            size="sm"
            onPress={handleConnect}
            isLoading={isConnecting}
            fullWidth
            startContent={
              !isConnecting && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.764 8.317c-.132.589-.482.732-.979.455l-2.7-1.988-1.303 1.255c-.144.144-.264.264-.542.264l.193-2.74 4.994-4.512c.217-.193-.047-.3-.336-.107l-6.17 3.883-2.66-.832c-.578-.18-.589-.578.12-.857l10.393-4.006c.482-.18.902.107.744.857z"/>
                </svg>
              )
            }
          >
            {t('profile.connectTelegram')}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

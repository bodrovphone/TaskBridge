'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Chip, Divider, Input } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, ClipboardPaste } from 'lucide-react';
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

  // Auto-refresh profile when user returns to tab after opening bot
  useEffect(() => {
    if (!showInstructions || telegramConnected) return;

    const handleFocus = () => {
      console.log('[Telegram] Tab focused, checking connection status...');
      onConnectionChange?.();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [showInstructions, telegramConnected, onConnectionChange]);

  // Hide instructions when connected
  useEffect(() => {
    if (telegramConnected) {
      setShowInstructions(false);
    }
  }, [telegramConnected]);

  const handleOpenBot = async () => {
    const locale = i18n.language || 'bg';

    // iOS Safari blocks window.open() after async operations
    // So we open the window FIRST, then update the URL after token is fetched
    const botWindow = window.open('about:blank', '_blank');

    try {
      // Generate a secure connection token
      const response = await authenticatedFetch('/api/telegram/generate-connection-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, locale })
      });

      if (response.ok) {
        const { token } = await response.json();
        // Deep link with token for auto-connect: ?start={locale}_{token}
        const botLink = `https://t.me/Trudify_bot?start=${locale}_${token}`;

        if (botWindow) {
          botWindow.location.href = botLink;
        } else {
          // Fallback if popup was blocked
          window.location.href = botLink;
        }

        // Show simplified instructions (auto-connect should work)
        setShowInstructions(true);
        setError(null);
      } else {
        // Fallback to old flow without token
        console.error('[Telegram] Failed to generate token, using fallback');
        const botLink = `https://t.me/Trudify_bot?start=${locale}`;

        if (botWindow) {
          botWindow.location.href = botLink;
        } else {
          window.location.href = botLink;
        }
        setShowInstructions(true);
        setError(null);
      }
    } catch (err) {
      // Fallback to old flow without token
      console.error('[Telegram] Error generating token:', err);
      const botLink = `https://t.me/Trudify_bot?start=${locale}`;

      if (botWindow) {
        botWindow.location.href = botLink;
      } else {
        window.location.href = botLink;
      }
      setShowInstructions(true);
      setError(null);
    }
  };

  // Core connect function that can be called with any ID
  const connectWithId = async (id: string) => {
    const cleanId = id.replace(/\D/g, ''); // Remove non-digits

    if (!cleanId || cleanId.trim() === '') {
      setError(t('profile.telegram.invalidIdFormat'));
      return;
    }

    // Validate it's a number
    if (!/^\d+$/.test(cleanId)) {
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
        body: JSON.stringify({ telegramId: cleanId, userId, locale })
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

  // Handle manual connect button click
  const handleConnect = async () => {
    await connectWithId(telegramId);
  };

  // Handle paste from clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanId = text.replace(/\D/g, ''); // Extract only digits

      if (cleanId) {
        setTelegramId(cleanId);
        // Auto-connect after paste
        await connectWithId(cleanId);
      } else {
        setError(t('profile.telegram.invalidIdFormat'));
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      // Fallback: just focus the input if clipboard access denied
      setError(t('profile.telegram.clipboardError', 'Please paste the ID manually'));
    }
  };

  // Handle paste event on input - auto-save
  const handleInputPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanId = pastedText.replace(/\D/g, ''); // Extract only digits

    if (cleanId) {
      setTelegramId(cleanId);
      // Small delay to show the pasted value, then auto-connect
      setTimeout(() => {
        connectWithId(cleanId);
      }, 300);
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

              {/* Paste Button - Primary action */}
              <Button
                color="primary"
                size="lg"
                fullWidth
                onPress={handlePasteFromClipboard}
                isLoading={isConnecting}
                startContent={!isConnecting && <ClipboardPaste className="w-5 h-5" />}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold mb-3"
              >
                {isConnecting ? t('profile.telegram.connecting', 'Connecting...') : t('profile.telegram.pasteAndConnect', 'Paste ID & Connect')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-500">
                    {t('common.or', 'or paste manually')}
                  </span>
                </div>
              </div>

              <Input
                type="text"
                label={t('profile.telegram.enterId')}
                placeholder="5108679736"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ''))}
                onPaste={handleInputPaste}
                size="lg"
                className="mt-3"
                classNames={{
                  input: 'text-center text-xl font-bold tracking-wide'
                }}
                description={t('profile.telegram.autoSaveHint', 'Paste your ID here - it will connect automatically')}
              />
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

'use client'

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { Button as NextUIButton } from "@nextui-org/react";
import { useAuth } from "@/features/auth";
import { useTranslation } from 'react-i18next';
import { LoginButton } from '@telegram-auth/react';
import type { TelegramUserData } from '@telegram-auth/server';

interface AuthSlideOverProps {
 isOpen: boolean;
 onClose: () => void;
 action: 'apply' | 'question' | 'create-task' | 'join-professional' | null;
}

/**
 * =============================================================================
 * AUTH SLIDE-OVER COMPONENT - Unified Login/Register Form
 * =============================================================================
 *
 * This component provides a single form for both login and registration.
 * The API automatically detects whether to login or register based on
 * whether the email already exists in the database.
 *
 * KEY STATES:
 * - fullName: User's name (only required for registration)
 * - email: User's email address
 * - password: User's password (min 6 chars)
 * - nameRequired: When true, highlights name field red (registration needed)
 * - showVerificationPrompt: Shows email verification UI after registration
 *
 * VISUAL BEHAVIOR:
 * - Name field is always visible but muted (60% opacity, gray bg)
 * - Name field shows hint "Only needed when creating a new account"
 * - If registration fails due to missing name:
 *   - nameRequired becomes true
 *   - Name field turns red with error styling
 *   - Hint changes to "Name is required to create your account"
 *
 * API ENDPOINT: /api/auth/unified
 * See that file for detailed flow documentation.
 */
export default function AuthSlideOver({ isOpen, onClose, action }: AuthSlideOverProps) {
 const { signInWithGoogle, signInWithFacebook, authenticatedFetch, refreshProfile } = useAuth();
 const { t, i18n } = useTranslation();
 const router = useRouter();

 // Form fields
 const [fullName, setFullName] = useState("");   // Only required for registration
 const [email, setEmail] = useState("");         // Required for all auth
 const [password, setPassword] = useState("");   // Required for all auth (min 6 chars)

 // UI state
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [nameRequired, setNameRequired] = useState(false);  // Controls name field red highlight
 const [mounted, setMounted] = useState(false);            // Portal mounting state

 // Post-registration state
 const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
 const [isResendingVerification, setIsResendingVerification] = useState(false);

 useEffect(() => {
  setMounted(true);
 }, []);

 if (!isOpen || !mounted) return null;

 const handleAuthSuccess = () => {
  // Reset loading state before closing
  setIsLoading(false);

  // Small delay to allow auth state to update
  setTimeout(() => {
   onClose();

   // Redirect based on action
   if (action === 'create-task') {
    router.push(`/${i18n.language}/create-task`);
   }
   // For other actions (apply, question), the parent component will handle them
  }, 100);
 };

 /**
  * ==========================================================================
  * UNIFIED AUTH HANDLER - Smart Login/Register Detection
  * ==========================================================================
  *
  * This is the main submit handler for the unified auth form. It calls the
  * /api/auth/unified endpoint which automatically determines whether to
  * login or register based on email existence.
  *
  * FLOW:
  * 1. User enters email + password (name is optional, shown but muted)
  * 2. Submit calls /api/auth/unified
  * 3. API checks if email exists:
  *    - EXISTS + correct password → LOGIN success
  *    - EXISTS + wrong password → ERROR "Invalid email or password"
  *    - NOT EXISTS + has name → REGISTER success
  *    - NOT EXISTS + no name → ERROR with name_required flag
  *
  * UI BEHAVIOR:
  * - nameRequired state controls name field highlighting
  * - When name_required error received: name field turns red, shows error
  * - User fills name and resubmits → registration proceeds
  *
  * DEBUG:
  * - Check browser console for 'Auth error' logs
  * - Check server logs for '[Auth/Unified]' prefixed messages
  * - Network tab: look at /api/auth/unified response
  */
 const handleSubmit = async () => {
  // Early return if required fields missing
  if (!email || !password) {
   console.log('[AuthSlideOver] Submit blocked: missing email or password');
   return;
  }

  console.log('[AuthSlideOver] Submitting unified auth:', {
   email,
   hasPassword: true,
   hasName: !!fullName.trim()
  });

  setIsLoading(true);
  setError(null);
  setNameRequired(false);  // Reset name highlight on new submission

  try {
   const response = await fetch('/api/auth/unified', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: fullName.trim() }),
   });

   const result = await response.json();
   console.log('[AuthSlideOver] API response:', {
    ok: response.ok,
    status: response.status,
    action: result.action,
    nameRequired: result.name_required
   });

   if (!response.ok) {
    // Check if this is a "name required" error (email is new, needs registration)
    if (result.name_required) {
     console.log('[AuthSlideOver] Name required - highlighting name field');
     setNameRequired(true);  // This triggers red border on name field
     setError(t('auth.nameRequired', 'Please provide your name to create an account'));
    } else {
     // Other errors (wrong password, validation, etc.)
     setError(result.error || 'Authentication failed');
    }
    setIsLoading(false);
    return;
   }

   // SUCCESS: Refresh auth context to pick up new session
   console.log('[AuthSlideOver] Auth success, refreshing profile...');
   await refreshProfile();

   // Close slide-over for both login and registration
   // Note: Email verification prompts are shown elsewhere in the app (banners)
   // so we don't need to block the user here after registration
   console.log(`[AuthSlideOver] ${result.action} complete - closing slide-over`);
   handleAuthSuccess();
  } catch (err) {
   // Network error or unexpected exception
   console.error('[AuthSlideOver] Auth error:', err);
   setError(t('auth.unexpectedError', 'An unexpected error occurred. Please try again.'));
   setIsLoading(false);
  }
 };

 const handleGoogleAuth = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // If no error, redirect happens automatically
  } catch (err) {
    // Handle popup blockers or other errors
    setError(t('auth.popupBlocked', 'Please allow popups for this site to sign in with Google'));
    setIsLoading(false);
  }
 };

 const handleFacebookAuth = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const result = await signInWithFacebook();
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // If no error, redirect happens automatically
  } catch (err) {
    // Handle popup blockers or other errors
    setError(t('auth.popupBlocked', 'Please allow popups for this site to sign in with Facebook'));
    setIsLoading(false);
  }
 };

 const handleTelegramAuth = async (data: TelegramUserData) => {
  setIsLoading(true);
  setError(null);

  try {
   const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
   });

   const result = await response.json();

   if (!response.ok) {
    setError(result.error || 'Failed to authenticate with Telegram');
    setIsLoading(false);
    return;
   }

   // Success! User is now in database
   console.log('Telegram auth successful:', result.user);
   handleAuthSuccess();
  } catch (err) {
   console.error('Telegram auth error:', err);
   setError('Failed to authenticate with Telegram');
   setIsLoading(false);
  }
 };

 const handleResendVerification = async () => {
  setIsResendingVerification(true);
  setError(null);

  try {
   const response = await authenticatedFetch('/api/auth/resend-verification', {
    method: 'POST',
   });

   const data = await response.json();

   if (!response.ok) {
    setError(data.error || t('auth.emailVerification.error', 'Failed to send verification email'));
   } else {
    // Show success message and close slide-over after delay
    setError(null);
    setTimeout(() => {
     handleAuthSuccess();
    }, 2000);
   }
  } catch (err) {
   console.error('Failed to resend verification email:', err);
   setError(t('auth.emailVerification.error', 'Failed to send verification email'));
  } finally {
   setIsResendingVerification(false);
  }
 };


 return createPortal(
  <>
   {/* Backdrop */}
   <div
    className="fixed inset-0 bg-black/50 transition-opacity"
    style={{ zIndex: 999998 }}
    onClick={onClose}
   />

   {/* Slide-over Panel */}
   <div
    className="fixed inset-0 w-full max-w-md h-full transform transition-transform duration-300 ease-in-out overflow-hidden bg-white ml-auto"
    style={{ zIndex: 999999, height: '100dvh', minHeight: '100vh' }}
   >
    <div className="flex h-full flex-col bg-white shadow-xl overflow-hidden">
     {/* Header */}
     <div className="bg-blue-600 px-6 py-4">
      <div className="flex items-center justify-between">
       <div>
        <h2 className="text-lg font-semibold text-white">
         {action === 'apply' ? t('auth.applyForTask') :
          action === 'question' ? t('auth.askQuestion') :
          action === 'create-task' ? t('auth.createTask') :
          action === 'join-professional' ? t('auth.joinAsProfessional') : t('auth.loginOrRegister')}
        </h2>
        <p className="text-blue-100 text-sm">
         {t('auth.loginOrRegisterToContinue')}
        </p>
       </div>
       <button
        type="button"
        onClick={(e) => {
         e.preventDefault()
         e.stopPropagation()
         onClose()
        }}
        className="flex items-center justify-center w-12 h-12 text-white hover:bg-blue-700 rounded-lg transition-colors touch-manipulation min-h-[48px] min-w-[48px]"
        aria-label="Close"
       >
        <X size={24} />
       </button>
      </div>
     </div>

     {/* Content */}
     <div className="flex-1 px-6 py-6 overflow-y-auto">
      <div className="space-y-6">
       {/* Action Description */}
       <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">
         {action === 'apply' ? `🎯 ${t('auth.applyForTask')}` :
          action === 'question' ? `💬 ${t('auth.askQuestion')}` :
          action === 'create-task' ? `➕ ${t('auth.createTask')}` :
          action === 'join-professional' ? `💼 ${t('auth.joinAsProfessional')}` : `🔐 ${t('auth.loginOrRegister')}`}
        </h3>
        <p className="text-sm text-gray-600">
         {action === 'apply'
          ? t('auth.applyDescription')
          : action === 'question'
          ? t('auth.questionDescription')
          : action === 'create-task'
          ? t('auth.createTaskDescription')
          : action === 'join-professional'
          ? t('auth.joinAsProfessionalDescription')
          : t('auth.loginOrRegisterDescription')
         }
        </p>
       </div>

       {/* Error Message */}
       {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
         {error}
        </div>
       )}

       {/* Verification Prompt - Shown after successful signup */}
       {showVerificationPrompt && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
         <h4 className="font-bold text-gray-900 mb-2">
          📧 {t('auth.emailVerification.checkInbox', 'Check your inbox!')}
         </h4>
         <p className="text-sm text-gray-700 mb-3">
          {t('auth.emailVerification.sentMessage', 'We sent a verification email to')} <strong>{email}</strong>
         </p>
         <p className="text-sm text-gray-600 mb-3">
          {t('auth.emailVerification.instructions', 'Click the link in the email to verify your account.')}
         </p>
         <div className="flex flex-col sm:flex-row gap-2">
          <NextUIButton
           size="sm"
           variant="flat"
           color="primary"
           onPress={handleResendVerification}
           isLoading={isResendingVerification}
           className="font-semibold"
          >
           {t('auth.emailVerification.resend', 'Resend Verification Email')}
          </NextUIButton>
          <NextUIButton
           size="sm"
           variant="bordered"
           onPress={handleAuthSuccess}
          >
           {t('auth.emailVerification.continue', 'Continue to App')}
          </NextUIButton>
         </div>
        </div>
       )}

       {/* Auth Form */}
       {!showVerificationPrompt && (
        <div className="space-y-4">
        {/* Email Field */}
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.email')}
         </label>
         <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
           if (e.key === 'Enter' && email && password) {
            handleSubmit();
           }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="your@email.com"
         />
        </div>

        {/* Password Field */}
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.password')}
         </label>
         <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
           if (e.key === 'Enter' && email && password) {
            handleSubmit();
           }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="••••••••"
         />
        </div>

        {/*
          NAME FIELD - Always visible but muted (unified auth UX)

          Visual states:
          1. Default (nameRequired=false):
             - 60% opacity, gray background, gray hint text
             - Shows "Only needed when creating a new account"

          2. Required (nameRequired=true):
             - Full opacity, red border, red background tint
             - Shows "Name is required to create your account"
             - Triggered when API returns { name_required: true }

          When user starts typing in name field while nameRequired=true,
          the onChange handler resets nameRequired to false (removes red styling)
        */}
        <div className={`transition-all duration-200 ${nameRequired ? '' : 'opacity-60'}`}>
         <label className={`block text-sm font-medium mb-2 ${nameRequired ? 'text-red-600' : 'text-gray-500'}`}>
          {t('auth.fullName', 'Your Name')}
         </label>
         <input
          type="text"
          value={fullName}
          onChange={(e) => {
           setFullName(e.target.value);
           if (nameRequired) setNameRequired(false);
          }}
          onKeyDown={(e) => {
           if (e.key === 'Enter' && email && password) {
            handleSubmit();
           }
          }}
          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors ${
           nameRequired
            ? 'border-2 border-red-500 bg-red-50'
            : 'border border-gray-300 bg-gray-50/50'
          }`}
          placeholder="John Doe"
         />
         <p className={`text-xs mt-1.5 ${nameRequired ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
          {nameRequired
           ? t('auth.nameRequiredHint', 'Name is required to create your account')
           : t('auth.nameHint', 'Only needed when creating a new account')
          }
         </p>
        </div>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end text-sm">
         <Link
          href={`/${i18n.language}/forgot-password`}
          className="text-blue-600 hover:text-blue-800"
          onClick={onClose}
         >
          {t('auth.forgotPassword')}
         </Link>
        </div>

        {/* Submit Button */}
        <NextUIButton
        color="primary"
        size="lg"
        className="w-full font-semibold shadow-md border-2 border-blue-700"
        onPress={handleSubmit}
        isLoading={isLoading}
        isDisabled={!email || !password}
       >
        {t('auth.continue')}
        </NextUIButton>

        {/* Social Login */}
        <div className="space-y-3">
        <NextUIButton
         variant="bordered"
         size="lg"
         className="w-full"
         onPress={handleGoogleAuth}
         isDisabled={isLoading}
         startContent={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
           <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
           <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
           <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
           <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
         }
        >
         {t('auth.continueWith')} Google
        </NextUIButton>

        {/* Facebook Login Button - HIDDEN until app is in Live Mode */}
        {/* @todo BEFORE-PROD: Uncomment when Facebook app is switched to Live Mode */}
        {/* See: todo_tasks/before-prod-release/facebook-oauth-live-mode.md */}
        {/* <NextUIButton
         variant="bordered"
         size="lg"
         className="w-full"
         onPress={handleFacebookAuth}
         isDisabled={isLoading}
         startContent={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
           <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
         }
        >
         {t('auth.continueWith')} Facebook
         </NextUIButton> */}

         {/* Telegram Login Button - COMMENTED OUT - Will be re-enabled later */}
         {/* <div className="w-full flex flex-col items-center gap-2">
         {typeof window !== 'undefined' && (
          <>
           <LoginButton
            botUsername="Trudify_bot"
            onAuthCallback={handleTelegramAuth}
            buttonSize="large"
            cornerRadius={8}
            showAvatar={false}
            lang={i18n.language === 'bg' ? 'bg' : i18n.language === 'ru' ? 'ru' : 'en'}
           />
           <p className="text-xs text-gray-500 text-center">
            {t('auth.telegramHint') || 'Opens Telegram app or desktop client'}
           </p>
          </>
         )}
        </div> */}
        </div>

       </div>
       )}

      </div>
     </div>
    </div>
   </div>
  </>,
  document.body
 );
}
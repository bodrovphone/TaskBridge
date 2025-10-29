'use client'

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { Button as NextUIButton } from "@nextui-org/react";
import { useAuth } from "@/features/auth";
import { useTranslation } from 'react-i18next';

interface AuthSlideOverProps {
 isOpen: boolean;
 onClose: () => void;
 action: 'apply' | 'question' | 'create-task' | 'join-professional' | null;
}

export default function AuthSlideOver({ isOpen, onClose, action }: AuthSlideOverProps) {
 const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();
 const { t, i18n } = useTranslation();
 const router = useRouter();
 const [mode, setMode] = useState<'login' | 'signup'>('login');
 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [mounted, setMounted] = useState(false);

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

 const handleLogin = async () => {
  if (!email || !password) return;

  setIsLoading(true);
  setError(null);

  const result = await signIn(email, password);

  if (result.error) {
   setError(result.error);
   setIsLoading(false);
  } else {
   handleAuthSuccess();
  }
 };

 const handleSignUp = async () => {
  if (!email || !password || !fullName) return;

  if (password !== confirmPassword) {
   setError('Passwords do not match');
   return;
  }

  if (password.length < 6) {
   setError('Password must be at least 6 characters');
   return;
  }

  setIsLoading(true);
  setError(null);

  const result = await signUp(email, password, fullName);

  if (result.error) {
   setError(result.error);
   setIsLoading(false);
  } else {
   handleAuthSuccess();
  }
 };

 const handleGoogleAuth = async () => {
  setIsLoading(true);
  setError(null);
  await signInWithGoogle();
  // Redirect happens automatically
 };

 const handleFacebookAuth = async () => {
  setIsLoading(true);
  setError(null);
  await signInWithFacebook();
  // Redirect happens automatically
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
    className="fixed top-0 bottom-0 right-0 w-full max-w-md h-screen transform transition-transform duration-300 ease-in-out"
    style={{ zIndex: 999999, height: '100dvh' }}
   >
    <div className="flex h-full flex-col bg-white shadow-xl">
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

       {/* Auth Form */}
       <div className="space-y-4">
        {mode === 'signup' && (
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
           Full Name
          </label>
          <input
           type="text"
           value={fullName}
           onChange={(e) => setFullName(e.target.value)}
           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           placeholder="John Doe"
          />
         </div>
        )}

        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.email')}
         </label>
         <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
           if (e.key === 'Enter' && mode === 'login' && email && password) {
            handleLogin();
           }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your@email.com"
         />
        </div>

        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.password')}
         </label>
         <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
           if (e.key === 'Enter' && mode === 'login' && email && password) {
            handleLogin();
           }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
         />
        </div>

        {mode === 'signup' && (
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
           Confirm Password
          </label>
          <input
           type="password"
           value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)}
           onKeyDown={(e) => {
            if (e.key === 'Enter' && mode === 'signup' && email && password && fullName && confirmPassword) {
             handleSignUp();
            }
           }}
           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           placeholder="••••••••"
          />
         </div>
        )}

        {mode === 'login' && (
         <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
           <input type="checkbox" className="mr-2 rounded" />
           {t('auth.rememberMe')}
          </label>
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
           {t('auth.forgotPassword')}
          </Link>
         </div>
        )}
       </div>

       {/* Submit Button */}
       <NextUIButton
        color="primary"
        size="lg"
        className="w-full font-semibold shadow-md border-2 border-blue-700"
        onPress={mode === 'login' ? handleLogin : handleSignUp}
        isLoading={isLoading}
        isDisabled={mode === 'login' ? (!email || !password) : (!email || !password || !fullName || !confirmPassword)}
       >
        {mode === 'login' ? t('auth.continue') : t('auth.createAccount')}
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

        <NextUIButton
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
        </NextUIButton>
       </div>

       {/* Toggle Mode */}
       <div className="text-center">
        <p className="text-sm text-gray-600">
         {mode === 'login' ? t('auth.noAccount') : 'Already have an account?'}
         {' '}
         <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-blue-600 hover:text-blue-800 font-medium"
          disabled={isLoading}
         >
          {mode === 'login' ? t('auth.createAccount') : t('auth.login')}
         </button>
        </p>
       </div>

      </div>
     </div>
    </div>
   </div>
  </>,
  document.body
 );
}
'use client'

import { useEffect } from 'react';
import { Button } from "@nextui-org/react";
import { AlertCircle, RotateCw, Home } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function TaskError({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 const router = useRouter();
 const params = useParams();
 const lang = (params?.lang as string) || 'bg';
 const t = useTranslations();

 useEffect(() => {
  // Log the error to an error reporting service
  console.error('Task detail error:', error);
 }, [error]);

 return (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
   <div className="max-w-md w-full text-center">
    {/* Error Icon */}
    <div className="mb-8 flex justify-center">
     <div className="relative">
      <AlertCircle className="w-24 h-24 text-red-400" strokeWidth={1.5} />
     </div>
    </div>

    {/* Message */}
    <h1 className="text-3xl font-bold text-gray-900 mb-4">
     {t('taskDetail.error.title')}
    </h1>
    <p className="text-gray-600 mb-2">
     {t('taskDetail.error.description')}
    </p>

    {/* Error details (dev only) */}
    {process.env.NODE_ENV === 'development' && (
     <details className="mb-6 text-left bg-white p-4 rounded-lg border border-red-200">
      <summary className="cursor-pointer text-sm font-medium text-red-600 mb-2">
       Error Details (Dev Only)
      </summary>
      <pre className="text-xs text-gray-700 overflow-auto">
       {error.message}
      </pre>
     </details>
    )}

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
     <Button
      color="danger"
      variant="bordered"
      startContent={<RotateCw size={18} />}
      onClick={reset}
     >
      {t('taskDetail.error.retry')}
     </Button>
     <Button
      color="primary"
      startContent={<Home size={18} />}
      onClick={() => router.push(`/${lang}`)}
     >
      {t('taskDetail.error.goHome')}
     </Button>
    </div>
   </div>
  </div>
 );
}

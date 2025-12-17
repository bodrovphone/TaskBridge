'use client'

import { Button } from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function TaskNotFound() {
 const router = useRouter();
 const params = useParams();
 const t = useTranslations();
 const locale = (params?.lang as string) || 'bg';

 return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
   <div className="max-w-md w-full text-center">
    {/* 404 Icon */}
    <div className="mb-8 flex justify-center">
     <div className="relative">
      <Search className="w-24 h-24 text-gray-300" strokeWidth={1.5} />
      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
       404
      </div>
     </div>
    </div>

    {/* Message */}
    <h1 className="text-3xl font-bold text-gray-900 mb-4">
     {t('taskDetail.notFound.title')}
    </h1>
    <p className="text-gray-600 mb-8">
     {t('taskDetail.notFound.description')}
    </p>

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
     <Button
      variant="bordered"
      startContent={<ArrowLeft size={18} />}
      onClick={() => router.back()}
     >
      {t('common.goBack')}
     </Button>
     <Button
      color="primary"
      onClick={() => router.push(`/${locale}/browse-tasks`)}
     >
      {t('taskDetail.notFound.browseTasks')}
     </Button>
    </div>
   </div>
  </div>
 );
}

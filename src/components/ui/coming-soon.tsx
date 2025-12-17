'use client'

import { useTranslations } from 'next-intl'

interface ComingSoonProps {
 title?: string;
 subtitle?: string;
 description?: string;
 icon?: string;
}

export default function ComingSoon({ 
 title,
 subtitle,
 description,
 icon = "🚧"
}: ComingSoonProps) {
 const t = useTranslations()

 return (
  <div className="container mx-auto px-4 py-8">
   <div className="text-center">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
     {title || t('comingSoon.defaultTitle')}
    </h1>
    {subtitle && (
     <p className="text-lg text-gray-600 mb-8">
      {subtitle}
     </p>
    )}
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
     <div className="text-6xl mb-4">{icon}</div>
     <h2 className="text-xl font-semibold text-blue-900 mb-2">
      {t('comingSoon.title')}
     </h2>
     <p className="text-blue-700">
      {description || t('comingSoon.defaultDescription')}
     </p>
    </div>
   </div>
  </div>
 )
}

ComingSoon.displayName = 'ComingSoon';
'use client'

import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CategoryCardProps {
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

export default function CategoryCard({ 
  title, 
  description, 
  count, 
  icon: Icon, 
  color,
  onClick 
}: CategoryCardProps) {
  const { t } = useTranslation();
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-primary-100 group-hover:text-primary-600",
    green: "bg-green-100 text-green-600 group-hover:bg-primary-100 group-hover:text-primary-600",
    purple: "bg-purple-100 text-purple-600 group-hover:bg-primary-100 group-hover:text-primary-600",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-primary-100 group-hover:text-primary-600",
  };

  return (
    <div 
      className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all hover:border-primary-200 group cursor-pointer p-6"
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 text-sm mb-4">{description}</p>
      <div className="text-sm text-primary-700 font-medium">
        {count}+ {t('landing.categories.activeSpecialists')}
      </div>
    </div>
  );
}

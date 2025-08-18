'use client'

import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardFooter } from "@nextui-org/react";

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
    <Card 
      isPressable
      onPress={onClick}
      className="bg-white hover:shadow-lg transition-all group border-1 border-gray-200 hover:border-primary"
    >
      <CardBody className="p-6 text-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 text-sm mb-4">{description}</p>
      </CardBody>
      <CardFooter className="px-6 pb-6 pt-0 justify-center">
        <div className="text-sm text-primary-700 font-medium">
          {count}+ {t('landing.categories.activeSpecialists')}
        </div>
      </CardFooter>
    </Card>
  );
}

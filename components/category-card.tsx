import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

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
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-primary-100 group-hover:text-primary-600",
    green: "bg-green-100 text-green-600 group-hover:bg-primary-100 group-hover:text-primary-600",
    purple: "bg-purple-100 text-purple-600 group-hover:bg-primary-100 group-hover:text-primary-600",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-primary-100 group-hover:text-primary-600",
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all hover:border-primary-200 group cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="text-sm text-primary-600 font-medium">
          {count}+ активни специалисти
        </div>
      </CardContent>
    </Card>
  );
}

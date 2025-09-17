'use client'

import { Card, CardBody, Image } from "@nextui-org/react";
import { Camera, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface PortfolioItem {
  id: string;
  title: string;
  beforeImage: string;
  afterImage: string;
}

interface PortfolioGalleryProps {
  portfolio: PortfolioItem[];
}

export default function PortfolioGallery({ portfolio }: PortfolioGalleryProps) {
  const { t } = useTranslation();

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Camera className="text-purple-600" size={24} />
          {t('professionalDetail.portfolio.title')}
        </h3>
        <div className="text-center py-8">
          <Camera className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">{t('professionalDetail.portfolio.noWork')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Camera className="text-purple-600" size={24} />
        {t('professionalDetail.portfolio.title')}
      </h3>

      <div className="space-y-6">
        {portfolio.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardBody className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {item.title}
              </h4>
              
              {/* Before & After Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {t('professionalDetail.portfolio.before')}
                  </div>
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={item.beforeImage}
                      alt={`${item.title} - ${t('professionalDetail.portfolio.before')}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="text-blue-500" size={32} />
                </div>
                
                {/* Mobile Arrow */}
                <div className="md:hidden flex justify-center py-2">
                  <ArrowRight className="text-blue-500 rotate-90" size={24} />
                </div>

                {/* After */}
                <div className="space-y-2 md:col-start-2">
                  <div className="text-sm font-medium text-green-600 uppercase tracking-wide">
                    {t('professionalDetail.portfolio.after')}
                  </div>
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={item.afterImage}
                      alt={`${item.title} - ${t('professionalDetail.portfolio.after')}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* View More Button */}
      {portfolio.length > 0 && (
        <div className="text-center mt-6">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">
            {t('professionalDetail.portfolio.viewMore')}
          </button>
        </div>
      )}
    </div>
  );
}
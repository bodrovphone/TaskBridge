'use client'

import { Card, CardBody, Chip } from "@nextui-org/react";
import { DollarSign, Clock } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
}

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <DollarSign className="text-green-600" size={24} />
        {t('professionalDetail.services.title')}
      </h3>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <Chip
                    size="lg"
                    className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-semibold px-4 py-2"
                    startContent={<DollarSign size={16} />}
                  >
                    {service.price}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Service Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <Clock className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              {t('professionalDetail.services.pricingNote.title')}
            </h4>
            <p className="text-blue-700 text-sm">
              {t('professionalDetail.services.pricingNote.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
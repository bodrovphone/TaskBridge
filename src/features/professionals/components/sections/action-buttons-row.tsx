'use client'

import { Button } from "@nextui-org/react";
import { MessageSquare, Heart, FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Professional {
 id: string;
 contactSettings: {
  allowDirectContact: boolean;
  preferredHours: string;
  contactMethods: string[];
 };
}

interface ActionButtonsRowProps {
 professional: Professional;
 onProposeTask: () => void;
 onAskQuestion: () => void;
 onSaveToFavorites: () => void;
}

export default function ActionButtonsRow({
 professional,
 onProposeTask,
 onAskQuestion,
 onSaveToFavorites
}: ActionButtonsRowProps) {
 const { t } = useTranslation();

 return (
  <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-gray-100">
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left Column */}
    <div className="flex flex-col gap-3">
     {/* Propose Task */}
     <Button
      size="md"
      color="primary"
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-300 font-semibold w-full"
      startContent={<FileText size={18} />}
      onClick={onProposeTask}
     >
      {t('professionalDetail.actions.proposeTask')}
     </Button>

     {/* Ask Question */}
     <Button
      size="md"
      variant="bordered"
      className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold w-full"
      startContent={<MessageSquare size={16} />}
      onClick={onAskQuestion}
     >
      {t('professionalDetail.actions.askQuestion')}
     </Button>
    </div>

    {/* Right Column - Save to Favorites */}
    <div className="flex flex-col gap-3">
     <Button
      size="md"
      variant="bordered"
      className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-colors w-full"
      onClick={onSaveToFavorites}
      startContent={<Heart size={16} />}
     >
      <span className="hidden sm:inline">{t('professionalDetail.actions.saveToFavorites')}</span>
      <span className="sm:hidden">Save</span>
     </Button>
    </div>
   </div>

   {/* Available Hours */}
   {professional.contactSettings.allowDirectContact && (
    <div className="mt-4 text-center">
     <p className="text-sm text-gray-600">
      {t('professionalDetail.contactHours')}: {professional.contactSettings.preferredHours}
     </p>
    </div>
   )}
  </div>
 );
}
'use client'

import { Button } from "@nextui-org/react";
import { Share2, UserPlus, Check } from "lucide-react";
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
 onInviteToApply: () => void;
 onShare: () => void;
 isShareCopied?: boolean;
}

export default function ActionButtonsRow({
 professional,
 onInviteToApply,
 onShare,
 isShareCopied = false
}: ActionButtonsRowProps) {
 const { t } = useTranslation();

 return (
  <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-gray-100">
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Invite to Apply - Primary Action */}
    <Button
     size="md"
     color="primary"
     className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-300 font-semibold w-full"
     startContent={<UserPlus size={18} />}
     onClick={onInviteToApply}
    >
     {t('professionalDetail.actions.inviteToApply')}
    </Button>

    {/* Share */}
    <Button
     size="md"
     variant="bordered"
     className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors w-full"
     onClick={onShare}
     startContent={isShareCopied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
    >
     {t('professionalDetail.actions.share')}
    </Button>
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
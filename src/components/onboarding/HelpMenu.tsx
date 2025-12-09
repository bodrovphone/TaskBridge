'use client'

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { HelpCircle, ClipboardList, Briefcase } from 'lucide-react'
import { useOnboardingContext } from './OnboardingProvider'

interface HelpMenuProps {
  variant?: 'button' | 'menuItem'
}

export function HelpMenu({ variant = 'button' }: HelpMenuProps) {
  const { t } = useTranslation()
  const { startTour } = useOnboardingContext()

  const trigger =
    variant === 'button' ? (
      <Button
        variant="light"
        size="sm"
        startContent={<HelpCircle size={18} />}
      >
        {t('onboarding.help.button')}
      </Button>
    ) : (
      <div className="flex items-center gap-2 w-full px-2 py-1.5 cursor-pointer">
        <HelpCircle size={18} />
        <span>{t('onboarding.help.button')}</span>
      </div>
    )

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>{trigger}</DropdownTrigger>
      <DropdownMenu aria-label={t('onboarding.help.menuLabel')}>
        <DropdownItem
          key="customer-tour"
          startContent={<ClipboardList size={18} />}
          description={t('onboarding.help.customerTour.description')}
          onPress={() => startTour('customer')}
        >
          {t('onboarding.help.customerTour.title')}
        </DropdownItem>
        <DropdownItem
          key="professional-tour"
          startContent={<Briefcase size={18} />}
          description={t('onboarding.help.professionalTour.description')}
          onPress={() => startTour('professional')}
        >
          {t('onboarding.help.professionalTour.title')}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

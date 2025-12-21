'use client'

import { Button } from '@nextui-org/react'
import { AlertTriangle, UserCircle, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ProfileWarningStepProps {
  /** List of missing fields (e.g., ['title', 'bio', 'skills']) */
  missingFields: string[]
  onUpdateProfile: () => void
  onIgnore: () => void
}

/**
 * Profile warning step for application wizard.
 * Shows when professional has incomplete profile (missing title/bio/categories).
 * Displayed as Step 0 before the actual application steps.
 */
export function ProfileWarningStep({
  missingFields,
  onUpdateProfile,
  onIgnore,
}: ProfileWarningStepProps) {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-amber-900 mb-2">
              {t('profileCompletion.warningTitle')}
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              {t('profileCompletion.warningDescription')}
            </p>

            {/* Missing fields list */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                {t('profileCompletion.missing')}:
              </p>
              <ul className="space-y-1">
                {missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2 text-sm text-amber-800">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                    {t(`profile.listing.requirement.${field}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          color="warning"
          size="lg"
          className="w-full font-semibold"
          startContent={<UserCircle className="w-5 h-5" />}
          onPress={onUpdateProfile}
        >
          {t('profileCompletion.updateProfile')}
        </Button>

        <Button
          variant="light"
          size="lg"
          className="w-full text-gray-600"
          endContent={<ArrowRight className="w-4 h-4" />}
          onPress={onIgnore}
        >
          {t('profileCompletion.ignoreAndProceed')}
        </Button>
      </div>
    </div>
  )
}

export default ProfileWarningStep

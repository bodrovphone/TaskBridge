'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
 Dropdown,
 DropdownTrigger,
 DropdownMenu,
 DropdownItem,
 DropdownSection
} from '@heroui/react'
import UserAvatar from './user-avatar'
import { useAuth } from '@/features/auth'
import {
 User,
 FileText,
 Briefcase,
 LogOut,
 Mail,
 Hammer,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-is-mobile'

interface UserAvatarDropdownProps {
 size?: 'sm' | 'md' | 'lg'
 className?: string
 onLoginClick?: () => void
 onNavigate?: () => void  // Called when user navigates via dropdown (to close parent menus)
}

export default function UserAvatarDropdown({
 size = 'md',
 className,
 onLoginClick,
 onNavigate
}: UserAvatarDropdownProps) {
 const { profile, signOut, authenticatedFetch } = useAuth()
 const t = useTranslations()
 const router = useRouter()
 const params = useParams()
 const lang = params?.lang as string || 'bg'
 const isMobile = useIsMobile('lg')
 const isIncompleteProfile = profile?.registrationIntent === 'professional'
  && (!profile.professionalTitle || profile.professionalTitle.length < 3
      || !profile.serviceCategories || profile.serviceCategories.length === 0)
 const [isResending, setIsResending] = useState(false)
 const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

 const handleResendVerification = async () => {
  setIsResending(true)
  setVerificationMessage(null)

  try {
   const response = await authenticatedFetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
   })

   const data = await response.json()

   if (!response.ok) {
    if (response.status === 400 && data.error?.includes('already verified')) {
     setVerificationMessage({ type: 'success', text: t('auth.emailVerification.alreadyVerified') })
    } else if (response.status === 429) {
     setVerificationMessage({ type: 'error', text: t('auth.emailVerification.rateLimited') })
    } else {
     setVerificationMessage({ type: 'error', text: data.error || t('auth.emailVerification.error') })
    }
   } else {
    setVerificationMessage({ type: 'success', text: t('auth.emailVerification.success') })
   }
  } catch (error) {
   console.error('Error resending verification email:', error)
   setVerificationMessage({ type: 'error', text: t('auth.emailVerification.error') })
  } finally {
   setIsResending(false)
  }
 }

 const handleMenuAction = (key: string) => {
  switch (key) {
   case 'verify-email':
    handleResendVerification()
    break
   case 'profile-customer':
    onNavigate?.()
    router.push(`/${lang}/profile/customer`)
    break
   case 'profile-professional':
    onNavigate?.()
    router.push(`/${lang}/profile/professional`)
    break
   case 'tasks-posted':
    onNavigate?.()
    router.push(`/${lang}/tasks/posted`)
    break
   case 'tasks-work':
    onNavigate?.()
    router.push(`/${lang}/tasks/work`)
    break
   case 'logout':
    onNavigate?.()
    signOut()
    router.push(`/${lang}`)
    break
  }
 }

 // For non-authenticated users, show a clickable avatar that triggers login
 if (!profile) {
  return (
   <div className={className}>
    <UserAvatar
     user={null}
     size={size}
     isClickable
     onClick={onLoginClick}
     className="ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-200"
    />
   </div>
  )
 }

 return (
  <Dropdown
   placement="bottom-end"
   className="min-w-[200px]"
   // Disable Framer Motion animations for better INP performance on mobile
   disableAnimation
   classNames={{
    content: "py-1 px-1 border border-gray-200 bg-white shadow-lg"
   }}
  >
    <DropdownTrigger>
     <button
      className={`${className || ''} relative`}
      aria-label={t('nav.profile')}
      type="button"
     >
      <UserAvatar
       user={profile}
       size={size}
       isClickable
       className="ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-200"
      />
      {isIncompleteProfile && (
       <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      )}
     </button>
    </DropdownTrigger>

    <DropdownMenu
     aria-label="User menu"
     onAction={(key) => handleMenuAction(key as string)}
     variant="flat"
     classNames={{
      list: "gap-1",
      base: "bg-white"
     }}
     itemClasses={{
      base: "data-[hover=true]:bg-gray-100 data-[selectable=true]:focus:bg-gray-100 rounded-lg"
     }}
    >
    {/* User Info Section */}
    <DropdownSection showDivider>
     <DropdownItem
      key="profile-professional"
      className="h-14 gap-2 cursor-pointer"
      textValue="User profile"
     >
      <div className="flex gap-3 items-center">
       <UserAvatar user={profile} size="sm" />
       <div className="flex flex-col">
        <p className="text-small font-semibold text-gray-900">
         {profile.fullName || profile.email}
        </p>
        <p className="text-tiny text-gray-500">{profile.email}</p>
       </div>
      </div>
     </DropdownItem>
    </DropdownSection>

    {/* Email Verification - Show only if not verified */}
    {!profile.isEmailVerified ? (
     <DropdownSection showDivider>
      <DropdownItem
       key="verify-email"
       startContent={
        isResending ? (
         <div className="w-[18px] h-[18px] border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
         <Mail className="text-blue-500" size={18} />
        )
       }
       className="text-blue-600 data-[hover=true]:text-blue-700"
       description={verificationMessage ? (
        <span className={verificationMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}>
         {verificationMessage.text}
        </span>
       ) : undefined}
      >
       {isResending ? t('auth.emailVerification.resending') : t('auth.emailVerification.resendButton')}
      </DropdownItem>
     </DropdownSection>
    ) : null}

    {/* Profile sections - simplified on mobile */}
    {isMobile ? (
     // Mobile: Just two profile links, no sections or sub-items
     <DropdownSection showDivider>
      <DropdownItem
       key="profile-customer"
       startContent={<User className="text-blue-500" size={18} />}
       className="text-gray-900"
      >
       {t('nav.profileCustomer')}
      </DropdownItem>
      <DropdownItem
       key="profile-professional"
       startContent={<Briefcase className="text-emerald-500" size={18} />}
       className="text-gray-900"
      >
       {t('nav.profileProfessional')}
      </DropdownItem>
     </DropdownSection>
    ) : (
     // Desktop: Full sections with sub-items
     <>
      <DropdownSection title={t('nav.forClient')} showDivider>
       <DropdownItem
        key="profile-customer"
        startContent={<User className="text-blue-500" size={18} />}
        className="text-gray-900"
       >
        {t('nav.profileCustomer')}
       </DropdownItem>
       <DropdownItem
        key="tasks-posted"
        startContent={<FileText className="text-blue-400 ml-4" size={18} />}
        className="text-gray-900 pl-4"
       >
        {t('nav.myPostedTasks')}
       </DropdownItem>
      </DropdownSection>

      <DropdownSection title={t('nav.forProfessionals')} showDivider>
       <DropdownItem
        key="profile-professional"
        startContent={<Briefcase className="text-emerald-500" size={18} />}
        className="text-gray-900"
       >
        {t('nav.profileProfessional')}
       </DropdownItem>
       <DropdownItem
        key="tasks-work"
        startContent={<Hammer className="text-emerald-400 ml-4" size={18} />}
        className="text-gray-900 pl-4"
       >
        {t('nav.myWork')}
       </DropdownItem>
      </DropdownSection>
     </>
    )}

    {/* Logout */}
    <DropdownSection>
     <DropdownItem
      key="logout"
      startContent={<LogOut className="text-red-500" size={18} />}
      className="text-red-600 data-[hover=true]:text-red-700"
      color="danger"
     >
      {t('logout')}
     </DropdownItem>
    </DropdownSection>
   </DropdownMenu>
  </Dropdown>
 )
}

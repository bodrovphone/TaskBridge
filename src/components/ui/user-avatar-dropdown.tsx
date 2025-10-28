'use client'

import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
 Dropdown,
 DropdownTrigger,
 DropdownMenu,
 DropdownItem,
 DropdownSection
} from '@nextui-org/react'
import UserAvatar from './user-avatar'
import { useAuth } from '@/features/auth'
import {
 User,
 FileText,
 Briefcase,
 Settings,
 HelpCircle,
 LogOut,
 Search,
 Send
} from 'lucide-react'

interface UserAvatarDropdownProps {
 size?: 'sm' | 'md' | 'lg'
 className?: string
 onLoginClick?: () => void
}

export default function UserAvatarDropdown({
 size = 'md',
 className,
 onLoginClick
}: UserAvatarDropdownProps) {
 const { profile, signOut } = useAuth()
 const { t } = useTranslation()
 const router = useRouter()
 const params = useParams()
 const lang = params?.lang as string || 'en'

 const handleMenuAction = (key: string) => {
  switch (key) {
   case 'profile':
    router.push(`/${lang}/profile`)
    break
   case 'tasks-posted':
    router.push(`/${lang}/tasks/posted`)
    break
   case 'browse-tasks':
    router.push(`/${lang}/browse-tasks`)
    break
   case 'tasks-applications':
    router.push(`/${lang}/tasks/applications`)
    break
   case 'tasks-work':
    router.push(`/${lang}/tasks/work`)
    break
   case 'settings':
    router.push(`/${lang}/settings`)
    break
   case 'help':
    router.push(`/${lang}/help`)
    break
   case 'logout':
    signOut()
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
   classNames={{
    content: "py-1 px-1 border border-gray-200"
   }}
  >
   <DropdownTrigger>
    <div className={className}>
     <UserAvatar
      user={profile}
      size={size}
      isClickable
      className="ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-200"
     />
    </div>
   </DropdownTrigger>

   <DropdownMenu
    aria-label="User menu"
    onAction={(key) => handleMenuAction(key as string)}
    variant="flat"
    classNames={{
     list: "gap-1"
    }}
   >
    {/* User Info Section */}
    <DropdownSection showDivider>
     <DropdownItem
      key="user-info"
      className="h-14 gap-2 opacity-100"
      textValue="User info"
      isReadOnly
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

    {/* Profile */}
    <DropdownSection showDivider>
     <DropdownItem
      key="profile"
      startContent={<User className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('nav.profile')}
     </DropdownItem>
    </DropdownSection>

    {/* For Customers */}
    <DropdownSection title={t('nav.forCustomers')} showDivider>
     <DropdownItem
      key="tasks-posted"
      startContent={<FileText className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('nav.myPostedTasks')}
     </DropdownItem>
    </DropdownSection>

    {/* For Professionals */}
    <DropdownSection title={t('nav.forProfessionals')} showDivider>
     <DropdownItem
      key="browse-tasks"
      startContent={<Search className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('nav.browseTasks')}
     </DropdownItem>
     <DropdownItem
      key="tasks-applications"
      startContent={<Send className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('nav.myApplications')}
     </DropdownItem>
     <DropdownItem
      key="tasks-work"
      startContent={<Briefcase className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('nav.myWork')}
     </DropdownItem>
    </DropdownSection>

    {/* General */}
    <DropdownSection showDivider>
     <DropdownItem
      key="settings"
      startContent={<Settings className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('settings')}
     </DropdownItem>
     <DropdownItem
      key="help"
      startContent={<HelpCircle className="text-gray-500" size={18} />}
      className="text-gray-900"
     >
      {t('nav.help')}
     </DropdownItem>
    </DropdownSection>

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
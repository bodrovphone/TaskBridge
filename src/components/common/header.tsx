'use client'

import { useState } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { LocaleLink } from "./locale-link"
import { LanguageSwitcher } from "./language-switcher"
import AuthSlideOver from "@/components/ui/auth-slide-over"
import UserAvatarDropdown from "@/components/ui/user-avatar-dropdown"
import NotificationBell from "./notification-bell"
import NotificationCenter from "./notification-center"
import { useTranslation } from 'react-i18next'
import { Plus, Handshake } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
 Navbar,
 NavbarBrand,
 NavbarContent,
 NavbarItem,
 NavbarMenuToggle,
 NavbarMenu,
 NavbarMenuItem,
 Button,
 Link as NextUILink
} from "@nextui-org/react"

function Header() {
 const pathname = usePathname()
 const { t } = useTranslation()
 const { isAuthenticated } = useAuth()
 const [isMenuOpen, setIsMenuOpen] = useState(false)
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false)
 const router = useRouter()
 const params = useParams()
 const lang = params?.lang as string || 'en'

 // Check if we're on the index/landing page
 const isIndexPage = pathname === `/${lang}` || pathname === `/${lang}/`

 // Dynamic categories link based on current page
 const categoriesHref = isIndexPage ? "/#categories" : "/categories"

 const navigation = [
  { name: t('nav.browseTasks'), href: "/browse-tasks" },
  { name: t('nav.howItWorks'), href: "/#how-it-works" },
  { name: t('nav.categories'), href: categoriesHref },
  { name: t('nav.forProfessionals'), href: "/professionals" },
 ]

 const handleCreateTask = () => {
  if (isAuthenticated) {
   // If authenticated, navigate directly to create task
   router.push(`/${lang}/create-task`)
  } else {
   // If not authenticated, show auth slide-over
   setIsAuthSlideOverOpen(true)
  }
 }

 return (
  <Navbar
   maxWidth="full"
   position="sticky"
   className="bg-white shadow-sm border-b border-gray-100 z-50"
   height="5rem"
   isBordered
   isMenuOpen={isMenuOpen}
   onMenuOpenChange={setIsMenuOpen}
   style={{ isolation: 'isolate' }}
  >
   {/* Logo/Brand */}
   <NavbarBrand>
    <LocaleLink href="/" className="flex items-center">
     <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mr-3">
      <Handshake className="text-white" size={20} />
     </div>
     <span className="text-xl font-bold text-gray-900">Trudify</span>
    </LocaleLink>
   </NavbarBrand>

   {/* Desktop Navigation */}
   <NavbarContent className="hidden lg:flex gap-8" justify="center">
    {navigation.map((item) => (
     <NavbarItem key={item.name}>
      <NextUILink
       as={LocaleLink}
       href={item.href}
       className="text-gray-900 hover:text-primary font-medium transition-colors relative"
       underline="hover"
      >
       {item.name}
      </NextUILink>
     </NavbarItem>
    ))}
   </NavbarContent>

   {/* Desktop Actions Section */}
   <NavbarContent justify="end" className="hidden lg:flex gap-3">
    <NavbarItem>
     <LanguageSwitcher />
    </NavbarItem>
    {isAuthenticated && (
     <NavbarItem>
      <NotificationBell />
     </NavbarItem>
    )}
    <NavbarItem>
     <Button
      color="primary"
      variant="solid"
      startContent={<Plus size={16} />}
      className="font-medium"
      onClick={handleCreateTask}
     >
      {t('nav.createTask')}
     </Button>
    </NavbarItem>
    <NavbarItem>
     {isAuthenticated ? (
      <UserAvatarDropdown size="md" />
     ) : (
      <UserAvatarDropdown
       size="md"
       onLoginClick={() => setIsAuthSlideOverOpen(true)}
      />
     )}
    </NavbarItem>
   </NavbarContent>

   {/* Mobile/Tablet Actions Section */}
   <NavbarContent justify="end" className="lg:hidden gap-4">
    <NavbarItem>
     <LanguageSwitcher />
    </NavbarItem>
    {isAuthenticated && (
     <NavbarItem>
      <NotificationBell />
     </NavbarItem>
    )}
    <NavbarItem>
     {isAuthenticated ? (
      <UserAvatarDropdown size="sm" />
     ) : (
      <UserAvatarDropdown
       size="sm"
       onLoginClick={() => setIsAuthSlideOverOpen(true)}
      />
     )}
    </NavbarItem>
    <NavbarMenuToggle />
   </NavbarContent>

   {/* Mobile Menu */}
   <NavbarMenu className="bg-white">
    {navigation.map((item) => (
     <NavbarMenuItem key={item.name}>
      <NextUILink
       as={LocaleLink}
       href={item.href}
       className="w-full text-gray-900 hover:text-primary font-medium py-2"
       size="lg"
       onClick={() => setIsMenuOpen(false)}
      >
       {item.name}
      </NextUILink>
     </NavbarMenuItem>
    ))}
    <NavbarMenuItem>
     <div className="pt-4 border-t border-gray-200 w-full">
      <Button
       color="primary"
       variant="solid"
       startContent={<Plus size={16} />}
       className="w-full font-medium"
       onClick={() => {
        setIsMenuOpen(false)
        handleCreateTask()
       }}
      >
       {t('nav.createTask')}
      </Button>
     </div>
    </NavbarMenuItem>
   </NavbarMenu>

   <AuthSlideOver
    isOpen={isAuthSlideOverOpen}
    onClose={() => setIsAuthSlideOverOpen(false)}
    action="create-task"
   />

   {/* Notification Center */}
   <NotificationCenter />
  </Navbar>
 )
}

Header.displayName = 'Header'

export default Header
'use client'

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { LocaleLink } from "./locale-link"
import { LanguageSwitcher } from "./language-switcher"
import AuthSlideOver from "@/components/ui/auth-slide-over"
import UserAvatarDropdown from "@/components/ui/user-avatar-dropdown"
import NotificationBell from "./notification-bell"
import NotificationCenter from "./notification-center"
import { useTranslation } from 'react-i18next'
import { Plus, FileText, Briefcase, Search, User, HelpCircle, LogOut, Lightbulb, Users, Hammer, SquarePen } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/features/auth"
import { useToast } from "@/hooks/use-toast"
import { Z_INDEX } from "@/lib/constants/z-index"
import { useCreateTask } from "@/hooks/use-create-task"
import { ReviewEnforcementDialog } from "@/features/reviews"
import { useOnboardingContext } from "@/components/onboarding"
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
 const { user, profile, signOut, notificationToken } = useAuth()
 // User is authenticated if they have a profile (either via Supabase auth OR notification token)
 const isAuthenticated = !!profile && (!!user || !!notificationToken)
 const [isMenuOpen, setIsMenuOpen] = useState(false)
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false)
 const [authAction, setAuthAction] = useState<'apply' | 'question' | 'create-task' | 'join-professional' | null>(null)
 const [isNavVisible, setIsNavVisible] = useState(true)
 const lastScrollY = useRef(0)
 const router = useRouter()
 const params = useParams()
 const lang = params?.lang as string || 'bg'
 const { toast } = useToast()
 const { restartTour } = useOnboardingContext()

 // Smart sticky navbar - hide on scroll down, show on scroll up
 useEffect(() => {
  const handleScroll = () => {
   const currentScrollY = window.scrollY
   const scrollingDown = currentScrollY > lastScrollY.current
   const scrolledPastThreshold = currentScrollY > 80

   // Show navbar when: scrolling up OR at the top of page
   // Hide navbar when: scrolling down AND past threshold
   if (scrollingDown && scrolledPastThreshold) {
    setIsNavVisible(false)
   } else {
    setIsNavVisible(true)
   }

   lastScrollY.current = currentScrollY
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
 }, [])

 // @todo FEATURE: Review enforcement (commented out until reviews feature is built)
 // const [isEnforcementDialogOpen, setIsEnforcementDialogOpen] = useState(false)
 // const [pendingReviewTasks, setPendingReviewTasks] = useState<PendingReviewTask[]>([])
 // const [currentReviewTaskIndex, setCurrentReviewTaskIndex] = useState(0)
 // const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
 // const [isSubmittingReview, setIsSubmittingReview] = useState(false)

 // Check if we're on the index/landing page
 const isIndexPage = pathname === `/${lang}` || pathname === `/${lang}/`

 // Explicit handler for menu state
 const handleMenuOpenChange = useCallback((open: boolean) => {
  setIsMenuOpen(open)
 }, [])

 const navigation = [
  { name: t('nav.howItWorks'), href: "/#how-it-works", icon: Lightbulb },
  { name: t('nav.createTask'), href: "/create-task", icon: SquarePen },
  { name: t('nav.browseProfessionals'), href: "/professionals", icon: Users },
  { name: t('nav.browseTasks'), href: "/browse-tasks", icon: Search },
 ]

 const {
  handleCreateTask: handleCreateTaskWithEnforcement,
  showAuthPrompt: showCreateTaskAuthPrompt,
  setShowAuthPrompt: setShowCreateTaskAuthPrompt,
  showEnforcementDialog,
  setShowEnforcementDialog,
  blockType,
  blockingTasks,
  handleReviewTask
 } = useCreateTask()

 const handleCreateTask = useCallback(() => {
  handleCreateTaskWithEnforcement()
 }, [handleCreateTaskWithEnforcement])

 // @todo FEATURE: Review handlers (commented out until reviews feature is built)
 // const handleStartReviewing = useCallback(() => {
 //  setIsEnforcementDialogOpen(false)
 //  setCurrentReviewTaskIndex(0)
 //  setIsReviewDialogOpen(true)
 // }, [])

 // const handleSubmitReview = useCallback(async (data: { taskId: string; rating: number; reviewText?: string; actualPricePaid?: number }) => {
 //  setIsSubmittingReview(true)
 //  try {
 //   await mockSubmitReview(data)
 //   const remainingCount = pendingReviewTasks.length - 1
 //   if (currentReviewTaskIndex < pendingReviewTasks.length - 1) {
 //    toast({ title: t('reviews.successWithRemaining', { remaining: remainingCount }), variant: 'success' })
 //    setCurrentReviewTaskIndex(prev => prev + 1)
 //   } else {
 //    toast({ title: t('reviews.success'), variant: 'success' })
 //    setIsReviewDialogOpen(false)
 //    setPendingReviewTasks([])
 //    setCurrentReviewTaskIndex(0)
 //    router.push(`/${lang}/create-task`)
 //   }
 //  } catch (error) {
 //   toast({ title: t('reviews.error'), variant: 'destructive' })
 //  } finally {
 //   setIsSubmittingReview(false)
 //  }
 // }, [pendingReviewTasks, currentReviewTaskIndex, t, toast, router, lang])

 return (
  <>
   <Navbar
    maxWidth="full"
    position="sticky"
    className={`bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 transition-all duration-300 ${
     isNavVisible ? 'translate-y-0' : '-translate-y-full'
    }`}
    style={{ zIndex: Z_INDEX.NAVBAR, position: 'fixed', top: 0, left: 0, right: 0 }}
    height="5rem"
    isBordered
    isMenuOpen={isMenuOpen}
    onMenuOpenChange={handleMenuOpenChange}
    classNames={{
     menuItem: 'relative',
    }}
    motionProps={{
     variants: {
      enter: {
       opacity: 1,
       y: 0,
       transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
       }
      },
      exit: {
       opacity: 0,
       y: 0,
       transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1]
       }
      }
     }
    }}
   >
   {/* Logo/Brand */}
   <NavbarBrand id="onboarding-welcome">
    <LocaleLink href="/" className="flex items-center">
     <Image
      src="/images/logo/trudify-logo-64.svg"
      alt="Trudify"
      width={40}
      height={40}
      className="mr-3"
      priority
     />
     <span className="text-xl font-bold text-gray-900">Trudify</span>
    </LocaleLink>
   </NavbarBrand>

   {/* Desktop Navigation */}
   <NavbarContent className="hidden lg:flex gap-2" justify="center">
    {navigation.map((item) => {
     const isActive = pathname === `/${lang}${item.href}` ||
      (item.href.startsWith('/#') && pathname === `/${lang}`)
     const Icon = item.icon
     // Generate ID for onboarding tour targeting
     const navId = item.href === '/create-task' ? 'nav-create-task'
      : item.href === '/professionals' ? 'nav-professionals'
      : item.href === '/browse-tasks' ? 'nav-browse-tasks'
      : undefined
     return (
      <NavbarItem key={item.name} id={navId}>
       <NextUILink
        as={LocaleLink}
        href={item.href}
        className={`
         group relative px-4 py-2 rounded-full font-medium text-sm
         transition-all duration-300 ease-out
         ${isActive
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
         }
        `}
       >
        <span className="flex items-center gap-2">
         <Icon
          size={16}
          className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`}
         />
         {item.name}
        </span>
        {/* Hover glow effect */}
        {!isActive && (
         <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 transition-all duration-300" />
        )}
       </NextUILink>
      </NavbarItem>
     )
    })}
   </NavbarContent>

   {/* Desktop Actions Section */}
   <NavbarContent justify="end" className="hidden lg:flex gap-4">
    <NavbarItem>
     <LanguageSwitcher />
    </NavbarItem>
    <NavbarItem id="nav-notifications">
     <NotificationBell
      onAuthRequired={() => {
       setAuthAction(null)
       setIsAuthSlideOverOpen(true)
      }}
     />
    </NavbarItem>
    <NavbarItem id="nav-user-menu" className="ml-1">
     {isAuthenticated ? (
      <UserAvatarDropdown size="md" />
     ) : (
      <UserAvatarDropdown
       size="md"
       onLoginClick={() => {
        setAuthAction(null)
        setIsAuthSlideOverOpen(true)
       }}
      />
     )}
    </NavbarItem>
   </NavbarContent>

   {/* Mobile/Tablet Actions Section */}
   <NavbarContent justify="end" className="lg:hidden gap-5">
    <NavbarItem>
     <LanguageSwitcher />
    </NavbarItem>
    {/* Hide notification bell and avatar when mobile menu is open */}
    {!isMenuOpen && (
     <>
      <NavbarItem>
       <NotificationBell
        onAuthRequired={() => {
         setAuthAction(null)
         setIsAuthSlideOverOpen(true)
        }}
       />
      </NavbarItem>
      <NavbarItem id="mobile-nav-user-menu">
       {isAuthenticated ? (
        <UserAvatarDropdown size="sm" />
       ) : (
        <UserAvatarDropdown
         size="sm"
         onLoginClick={() => {
          setAuthAction(null)
          setIsAuthSlideOverOpen(true)
         }}
        />
       )}
      </NavbarItem>
     </>
    )}
    <NavbarMenuToggle id="mobile-menu-toggle" />
   </NavbarContent>

   {/* Mobile Menu - z-index must be above tour overlay (9998) */}
   <NavbarMenu className="flex flex-col overflow-y-auto !bg-white" style={{ zIndex: Z_INDEX.MOBILE_MENU_TOUR }}>
    <div className="flex-1 overflow-y-auto pb-2">
     {/* Portfolio menu items for authenticated users */}
     {isAuthenticated ? (
      <>
       {/* For Client Section */}
       <NavbarMenuItem>
        <div className="w-full">
         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {t('nav.forClient')}
         </p>
        </div>
       </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/profile/customer`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/profile/customer`)
        }}
       >
        <User size={18} className="text-blue-500" />
        {t('nav.profileCustomer')}
       </NextUILink>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/tasks/posted`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 pl-4 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/tasks/posted`)
        }}
       >
        <FileText size={18} className="text-blue-400" />
        {t('nav.myPostedTasks')}
       </NextUILink>
      </NavbarMenuItem>

      {/* For Professional Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.forProfessionals')}
        </p>
       </div>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/profile/professional`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/profile/professional`)
        }}
       >
        <Briefcase size={18} className="text-emerald-500" />
        {t('nav.profileProfessional')}
       </NextUILink>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/tasks/work`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 pl-4 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/tasks/work`)
        }}
       >
        <Hammer size={18} className="text-emerald-400" />
        {t('nav.myWork')}
       </NextUILink>
      </NavbarMenuItem>

      {/* Main Navigation Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.discover', 'Discover')}
        </p>
       </div>
      </NavbarMenuItem>
      {navigation.map((item) => {
       const Icon = item.icon
       // Assign colors based on nav item
       const iconColor = item.href === '/create-task' ? 'text-indigo-500'
        : item.href === '/professionals' ? 'text-amber-500'
        : item.href === '/browse-tasks' ? 'text-teal-500'
        : 'text-yellow-500'
       // Mobile nav IDs for onboarding tour
       const mobileNavId = item.href === '/create-task' ? 'mobile-nav-create-task'
        : item.href === '/browse-tasks' ? 'mobile-nav-browse-tasks'
        : undefined
       return (
        <NavbarMenuItem key={item.name} id={mobileNavId}>
         <NextUILink
          href={item.href.startsWith('/') ? `/${lang}${item.href}` : item.href}
          className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
          size="lg"
          onPress={() => {
          setIsMenuOpen(false)
          if (item.href.startsWith('#') || item.href.startsWith('/#')) {
           // Handle anchor links - check if we're on index page
           const anchorId = item.href.replace(/^\/#?/, '')
           const isOnIndexPage = pathname === `/${lang}` || pathname === `/${lang}/`

           if (isOnIndexPage) {
            // Already on index page - smooth scroll to anchor
            const element = document.getElementById(anchorId)
            if (element) {
             element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
           } else {
            // Navigate to index page first, then scroll
            router.push(`/${lang}#${anchorId}`)
           }
          } else {
           // Handle regular routes
           router.push(item.href.startsWith('/') ? `/${lang}${item.href}` : item.href)
          }
         }}
        >
         <Icon size={18} className={iconColor} />
         {item.name}
        </NextUILink>
        </NavbarMenuItem>
       )
      })}

      {/* Help Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full" />
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2 cursor-pointer"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         setTimeout(() => restartTour(), 200)
        }}
       >
        <HelpCircle size={18} className="text-purple-500" />
        {t('nav.help')}
       </NextUILink>
      </NavbarMenuItem>

      {/* Logout */}
       <NavbarMenuItem>
        <NextUILink
         className="w-full text-red-600 hover:text-red-700 font-medium py-2 flex items-center gap-2"
         size="lg"
         onPress={() => {
          setIsMenuOpen(false)
          signOut()
         }}
        >
         <LogOut size={18} className="text-red-500" />
         {t('logout')}
        </NextUILink>
       </NavbarMenuItem>
      </>
     ) : (
      // Non-authenticated users see navigation at the top
      <>
       {navigation.map((item) => {
        const Icon = item.icon
        // Assign colors based on nav item
        const iconColor = item.href === '/create-task' ? 'text-indigo-500'
         : item.href === '/professionals' ? 'text-amber-500'
         : item.href === '/browse-tasks' ? 'text-teal-500'
         : 'text-yellow-500'
        // Mobile nav IDs for onboarding tour
        const mobileNavId = item.href === '/create-task' ? 'mobile-nav-create-task'
         : item.href === '/browse-tasks' ? 'mobile-nav-browse-tasks'
         : undefined
        return (
         <NavbarMenuItem key={item.name} id={mobileNavId}>
          <NextUILink
           href={item.href.startsWith('/') ? `/${lang}${item.href}` : item.href}
           className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
           size="lg"
           onPress={() => {
           setIsMenuOpen(false)
           if (item.href.startsWith('#') || item.href.startsWith('/#')) {
            // Handle anchor links - check if we're on index page
            const anchorId = item.href.replace(/^\/#?/, '')
            const isOnIndexPage = pathname === `/${lang}` || pathname === `/${lang}/`

            if (isOnIndexPage) {
             // Already on index page - smooth scroll to anchor
             const element = document.getElementById(anchorId)
             if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
             }
            } else {
             // Navigate to index page first, then scroll
             router.push(`/${lang}#${anchorId}`)
            }
           } else {
            // Handle regular routes
            router.push(item.href.startsWith('/') ? `/${lang}${item.href}` : item.href)
           }
          }}
         >
          <Icon size={18} className={iconColor} />
          {item.name}
         </NextUILink>
         </NavbarMenuItem>
        )
       })}

       {/* Help Section for non-authenticated users */}
       <NavbarMenuItem>
        <div className="pt-4 border-t border-gray-200 w-full" />
       </NavbarMenuItem>
       <NavbarMenuItem>
        <NextUILink
         className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2 cursor-pointer"
         size="lg"
         onPress={() => {
          setIsMenuOpen(false)
          setTimeout(() => restartTour(), 200)
         }}
        >
         <HelpCircle size={18} className="text-purple-500" />
         {t('nav.help')}
        </NextUILink>
       </NavbarMenuItem>
      </>
     )}
    </div>

    {/* Sticky Bottom Section - Always visible */}
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-3 safe-area-pb">
     {/* Create Task Button - Sticky */}
     <div className="px-4 pb-2 w-full">
      <Button
       color="primary"
       variant="solid"
       startContent={<Plus size={20} />}
       size="lg"
       className="w-full font-semibold shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
       onPress={() => {
        setIsMenuOpen(false)
        // Small delay to let menu close animation complete before showing dialogs
        setTimeout(() => {
         handleCreateTask()
        }, 150)
       }}
      >
       {t('nav.createTask')}
      </Button>
     </div>

     {/* Close Menu Button */}
     <div className="px-4 pb-16 w-full">
      <Button
       variant="flat"
       size="lg"
       className="w-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
       onPress={() => setIsMenuOpen(false)}
      >
       {t('nav.closeMenu', 'Close Menu')}
      </Button>
     </div>
    </div>
   </NavbarMenu>

   {/* Notification Center */}
   <NotificationCenter />
  </Navbar>

  {/* Auth Slide Over */}
  <AuthSlideOver
   isOpen={isAuthSlideOverOpen || showCreateTaskAuthPrompt}
   onClose={() => {
    setIsAuthSlideOverOpen(false)
    setShowCreateTaskAuthPrompt(false)
   }}
   action={showCreateTaskAuthPrompt ? 'create-task' : authAction}
  />

  {/* Floating Action Buttons - Mobile Only (hide when menu is open or on profile/form pages) */}
  {!isMenuOpen && !pathname.includes('/profile') && !pathname.includes('/create-task') && !pathname.includes('/edit') && (
  <div
    className="lg:hidden fixed right-0 bottom-8 translate-x-[15%] flex flex-col gap-4 [body:has([role=dialog]:not([hidden]))_&]:hidden"
    style={{ zIndex: Z_INDEX.FLOATING_BUTTONS }}
  >
   {/* Browse Tasks Button - Hide on browse-tasks page */}
   {!pathname.includes('/browse-tasks') && (
    <Button
     isIconOnly
     color="success"
     variant="solid"
     size="lg"
     className="w-16 h-16 rounded-full shadow-2xl font-medium bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transform transition-transform hover:scale-110 active:scale-95 pointer-events-auto"
     onPress={() => router.push(`/${lang}/browse-tasks`)}
     aria-label={t('nav.browseTasks')}
    >
     <Search size={28} strokeWidth={2.5} />
    </Button>
   )}

   {/* Create Task Button - Hide on create-task page */}
   {!pathname.includes('/create-task') && (
    <Button
     isIconOnly
     color="primary"
     variant="solid"
     size="lg"
     className="w-16 h-16 rounded-full shadow-2xl font-medium bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-transform hover:scale-110 active:scale-95 pointer-events-auto"
     onPress={handleCreateTask}
     aria-label={t('nav.createTask')}
    >
     <Plus size={28} strokeWidth={2.5} />
    </Button>
   )}
  </div>
  )}

  {/* Review Enforcement Dialog */}
  <ReviewEnforcementDialog
    isOpen={showEnforcementDialog}
    onClose={() => setShowEnforcementDialog(false)}
    blockType={blockType}
    pendingTasks={blockingTasks}
    onReviewTask={handleReviewTask}
  />
 </>
 )
}

Header.displayName = 'Header'

export default Header
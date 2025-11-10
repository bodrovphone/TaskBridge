'use client'

import { useState, useCallback } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { LocaleLink } from "./locale-link"
import { LanguageSwitcher } from "./language-switcher"
import AuthSlideOver from "@/components/ui/auth-slide-over"
import UserAvatarDropdown from "@/components/ui/user-avatar-dropdown"
import NotificationBell from "./notification-bell"
import NotificationCenter from "./notification-center"
import { useTranslation } from 'react-i18next'
import { Plus, Handshake, FileText, Send, Briefcase, Search, User, HelpCircle, LogOut } from "lucide-react"
import { useAuth } from "@/features/auth"
import { useToast } from "@/hooks/use-toast"
import { Z_INDEX } from "@/lib/constants/z-index"
// @todo FEATURE: Uncomment when reviews feature is built
// import { ReviewDialog, ReviewEnforcementDialog } from "@/features/reviews"
// import { mockCanCreateTask, mockSubmitReview, type PendingReviewTask } from "@/features/reviews"
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
 const { user, profile, signOut } = useAuth()
 const isAuthenticated = !!user && !!profile
 const [isMenuOpen, setIsMenuOpen] = useState(false)
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false)
 const [authAction, setAuthAction] = useState<'apply' | 'question' | 'create-task' | 'join-professional' | null>(null)
 const router = useRouter()
 const params = useParams()
 const lang = params?.lang as string || 'bg'
 const { toast } = useToast()

 // @todo FEATURE: Review enforcement (commented out until reviews feature is built)
 // const [isEnforcementDialogOpen, setIsEnforcementDialogOpen] = useState(false)
 // const [pendingReviewTasks, setPendingReviewTasks] = useState<PendingReviewTask[]>([])
 // const [currentReviewTaskIndex, setCurrentReviewTaskIndex] = useState(0)
 // const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
 // const [isSubmittingReview, setIsSubmittingReview] = useState(false)

 // Check if we're on the index/landing page
 const isIndexPage = pathname === `/${lang}` || pathname === `/${lang}/`

 // Dynamic categories link based on current page
 const categoriesHref = isIndexPage ? "/#categories" : "/categories"

 // Explicit handler for menu state
 const handleMenuOpenChange = useCallback((open: boolean) => {
  setIsMenuOpen(open)
 }, [])

 const navigation = [
  { name: t('nav.browseTasks'), href: "/browse-tasks" },
  { name: t('nav.howItWorks'), href: "/#how-it-works" },
  { name: t('nav.categories'), href: categoriesHref },
  { name: t('nav.forProfessionals'), href: "/professionals" },
 ]

 const handleCreateTask = useCallback(() => {
  if (!isAuthenticated) {
   // If not authenticated, show auth slide-over with create-task action
   setAuthAction('create-task')
   setIsAuthSlideOverOpen(true)
   return
  }

  // @todo FEATURE: Add review enforcement when reviews feature is built
  // Check for pending reviews and show ReviewEnforcementDialog if needed

  // All clear - proceed to create task
  router.push(`/${lang}/create-task`)
 }, [isAuthenticated, lang, router])

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
    className="bg-white shadow-sm border-b border-gray-100"
    style={{ zIndex: Z_INDEX.NAVBAR }}
    height="5rem"
    isBordered
    isMenuOpen={isMenuOpen}
    onMenuOpenChange={handleMenuOpenChange}
    classNames={{
     menu: 'bg-white z-[9999]',
     menuItem: 'relative',
    }}
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
     <LanguageSwitcher />
    </NavbarItem>
    <NavbarItem>
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
   <NavbarContent justify="end" className="lg:hidden gap-4">
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
       onLoginClick={() => {
        setAuthAction(null)
        setIsAuthSlideOverOpen(true)
       }}
      />
     )}
    </NavbarItem>
    <NavbarMenuToggle />
   </NavbarContent>

   {/* Mobile Menu */}
   <NavbarMenu>
    {navigation.map((item) => (
     <NavbarMenuItem key={item.name}>
      <NextUILink
       href={item.href.startsWith('/') ? `/${lang}${item.href}` : item.href}
       className="w-full text-gray-900 hover:text-primary font-medium py-2"
       size="lg"
       onPress={() => {
        setIsMenuOpen(false)
        if (item.href.startsWith('#') || item.href.startsWith('/#')) {
         // Handle anchor links
         window.location.href = `/${lang}${item.href}`
        } else {
         // Handle regular routes
         router.push(item.href.startsWith('/') ? `/${lang}${item.href}` : item.href)
        }
       }}
      >
       {item.name}
      </NextUILink>
     </NavbarMenuItem>
    ))}

    {/* Create Task Button */}
    <NavbarMenuItem>
     <div className="pt-2 w-full">
      <Button
       color="primary"
       variant="solid"
       startContent={<Plus size={16} />}
       className="w-full font-medium"
       onPress={() => {
        setIsMenuOpen(false)
        handleCreateTask()
       }}
      >
       {t('nav.createTask')}
      </Button>
     </div>
    </NavbarMenuItem>

    {/* Portfolio menu items for authenticated users */}
    {isAuthenticated && (
     <>
      {/* Profile Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.profile', 'Profile')}
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
        <User size={18} className="text-gray-500" />
        {t('nav.profileCustomer')}
       </NextUILink>
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
        <Briefcase size={18} className="text-gray-500" />
        {t('nav.profileProfessional')}
       </NextUILink>
      </NavbarMenuItem>

      {/* For Customers Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.forCustomers')}
        </p>
       </div>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/tasks/posted`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/tasks/posted`)
        }}
       >
        <FileText size={18} className="text-gray-500" />
        {t('nav.myPostedTasks')}
       </NextUILink>
      </NavbarMenuItem>

      {/* For Professionals Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.forProfessionals')}
        </p>
       </div>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/tasks/applications`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/tasks/applications`)
        }}
       >
        <Send size={18} className="text-gray-500" />
        {t('nav.myApplications')}
       </NextUILink>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/tasks/work`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/tasks/work`)
        }}
       >
        <Briefcase size={18} className="text-gray-500" />
        {t('nav.myWork')}
       </NextUILink>
      </NavbarMenuItem>

      {/* General Section */}
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.general', 'General')}
        </p>
       </div>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        href={`/${lang}/help`}
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => {
         setIsMenuOpen(false)
         router.push(`/${lang}/help`)
        }}
       >
        <HelpCircle size={18} className="text-gray-500" />
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
    )}

    {/* Language Switcher */}
    <NavbarMenuItem>
     <div className="pt-6 border-t border-gray-200 w-full">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
       {t('nav.language', 'Language')}
      </p>
     </div>
    </NavbarMenuItem>
    <NavbarMenuItem>
     <div className="pb-2 w-full flex justify-start">
      <LanguageSwitcher />
     </div>
    </NavbarMenuItem>

    <NavbarMenuItem>
     <div className="pt-4 pb-2 w-full">
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
    </NavbarMenuItem>
   </NavbarMenu>

   {/* Notification Center */}
   <NotificationCenter />
  </Navbar>

  {/* Auth Slide Over */}
  <AuthSlideOver
   isOpen={isAuthSlideOverOpen}
   onClose={() => setIsAuthSlideOverOpen(false)}
   action={authAction}
  />

  {/* Floating Action Buttons - Mobile Only (hide when menu is open or on profile pages) */}
  {!isMenuOpen && !pathname.includes('/profile') && (
  <div
    className="lg:hidden fixed right-0 bottom-8 translate-x-[15%] flex flex-col gap-4"
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

  {/* @todo FEATURE: Review dialogs (commented out until reviews feature is built) */}
  {/* <ReviewEnforcementDialog
   isOpen={isEnforcementDialogOpen}
   onClose={() => setIsEnforcementDialogOpen(false)}
   blockType={pendingReviewTasks.length > 0 ? 'missing_reviews' : null}
   pendingTasks={pendingReviewTasks}
   onReviewTask={handleStartReviewing}
  /> */}

  {/* <ReviewDialog - Sequential Flow */}
  {/* {pendingReviewTasks.length > 0 && (
   <ReviewDialog
    isOpen={isReviewDialogOpen}
    onClose={() => setIsReviewDialogOpen(false)}
    onSubmit={handleSubmitReview}
    task={pendingReviewTasks[currentReviewTaskIndex]}
    isLoading={isSubmittingReview}
    currentIndex={currentReviewTaskIndex}
    totalCount={pendingReviewTasks.length}
   />
  )} */}
 </>
 )
}

Header.displayName = 'Header'

export default Header
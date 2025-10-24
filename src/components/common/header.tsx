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
import { Plus, Handshake, FileText, Send, Briefcase } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { ReviewDialog, ReviewEnforcementDialog } from "@/features/reviews"
import { mockCanCreateTask, mockSubmitReview, type PendingReviewTask } from "@/features/reviews"
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
 const { toast } = useToast()

 // Review enforcement state
 const [isEnforcementDialogOpen, setIsEnforcementDialogOpen] = useState(false)
 const [pendingReviewTasks, setPendingReviewTasks] = useState<PendingReviewTask[]>([])
 const [currentReviewTaskIndex, setCurrentReviewTaskIndex] = useState(0)
 const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
 const [isSubmittingReview, setIsSubmittingReview] = useState(false)

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
   // If not authenticated, show auth slide-over
   setIsAuthSlideOverOpen(true)
   return
  }

  // Check for pending reviews (mock function - will be replaced with API in Phase 2)
  const { canCreate, blockType, pendingTasks } = mockCanCreateTask()

  if (!canCreate && pendingTasks.length > 0) {
   // User has pending reviews - show enforcement dialog
   setPendingReviewTasks(pendingTasks)
   setCurrentReviewTaskIndex(0)
   setIsEnforcementDialogOpen(true)
  } else {
   // All clear - proceed to create task
   router.push(`/${lang}/create-task`)
  }
 }, [isAuthenticated, lang, router])

 const handleStartReviewing = useCallback(() => {
  setIsEnforcementDialogOpen(false)
  setCurrentReviewTaskIndex(0)
  setIsReviewDialogOpen(true)
 }, [])

 const handleSubmitReview = useCallback(async (data: { taskId: string; rating: number; reviewText?: string; actualPricePaid?: number }) => {
  setIsSubmittingReview(true)
  try {
   await mockSubmitReview(data)

   const remainingCount = pendingReviewTasks.length - 1

   if (currentReviewTaskIndex < pendingReviewTasks.length - 1) {
    // More reviews to go
    toast({
     title: t('reviews.successWithRemaining', { remaining: remainingCount }),
     variant: 'success'
    })
    setCurrentReviewTaskIndex(prev => prev + 1)
   } else {
    // All reviews done!
    toast({
     title: t('reviews.success'),
     variant: 'success'
    })
    setIsReviewDialogOpen(false)
    setPendingReviewTasks([])
    setCurrentReviewTaskIndex(0)

    // Now proceed to create task
    router.push(`/${lang}/create-task`)
   }
  } catch (error) {
   toast({
    title: t('reviews.error'),
    variant: 'destructive'
   })
  } finally {
   setIsSubmittingReview(false)
  }
 }, [pendingReviewTasks, currentReviewTaskIndex, t, toast, router, lang])

 return (
  <>
   <Navbar
    maxWidth="full"
    position="sticky"
    className="bg-white shadow-sm border-b border-gray-100 z-50"
    height="5rem"
    isBordered
    isMenuOpen={isMenuOpen}
    onMenuOpenChange={handleMenuOpenChange}
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
       onPress={() => setIsMenuOpen(false)}
      >
       {item.name}
      </NextUILink>
     </NavbarMenuItem>
    ))}

    {/* Portfolio menu items for authenticated users */}
    {isAuthenticated && (
     <>
      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.forCustomers')}
        </p>
       </div>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        as={LocaleLink}
        href="/tasks/posted"
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => setIsMenuOpen(false)}
       >
        <FileText size={18} className="text-gray-500" />
        {t('nav.myPostedTasks')}
       </NextUILink>
      </NavbarMenuItem>

      <NavbarMenuItem>
       <div className="pt-4 border-t border-gray-200 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
         {t('nav.forProfessionals')}
        </p>
       </div>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        as={LocaleLink}
        href="/tasks/applications"
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => setIsMenuOpen(false)}
       >
        <Send size={18} className="text-gray-500" />
        {t('nav.myApplications')}
       </NextUILink>
      </NavbarMenuItem>
      <NavbarMenuItem>
       <NextUILink
        as={LocaleLink}
        href="/tasks/work"
        className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
        size="lg"
        onPress={() => setIsMenuOpen(false)}
       >
        <Briefcase size={18} className="text-gray-500" />
        {t('nav.myWork')}
       </NextUILink>
      </NavbarMenuItem>
     </>
    )}

    <NavbarMenuItem>
     <div className="pt-4 border-t border-gray-200 w-full">
      <Button
       color="primary"
       variant="solid"
       startContent={<Plus size={16} />}
       className="w-full font-medium"
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
   action="create-task"
  />

  {/* Review Enforcement Dialog */}
  <ReviewEnforcementDialog
   isOpen={isEnforcementDialogOpen}
   onClose={() => setIsEnforcementDialogOpen(false)}
   blockType={pendingReviewTasks.length > 0 ? 'missing_reviews' : null}
   pendingTasks={pendingReviewTasks}
   onReviewTask={handleStartReviewing}
  />

  {/* Review Dialog - Sequential Flow */}
  {pendingReviewTasks.length > 0 && (
   <ReviewDialog
    isOpen={isReviewDialogOpen}
    onClose={() => setIsReviewDialogOpen(false)}
    onSubmit={handleSubmitReview}
    task={pendingReviewTasks[currentReviewTaskIndex]}
    isLoading={isSubmittingReview}
    currentIndex={currentReviewTaskIndex}
    totalCount={pendingReviewTasks.length}
   />
  )}
 </>
 )
}

Header.displayName = 'Header'

export default Header
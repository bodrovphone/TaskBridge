'use client'

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { Share2, Edit3, Check, LogOut, CheckCircle, Globe } from "lucide-react";
import { Button as NextUIButton, Card as NextUICard, CardBody, Tooltip, Chip } from "@heroui/react";
import { useTranslations } from 'next-intl';
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import ApplicationDialog from "@/components/tasks/application-dialog";
import { ProfessionalWithdrawDialog } from "@/components/tasks/professional-withdraw-dialog";
import { MarkCompletedDialog } from "@/components/tasks/mark-completed-dialog";
// @todo FEATURE: Questions feature - commented out for future implementation
// import { MessageCircle } from "lucide-react";
// import AskQuestionDialog from "@/components/tasks/ask-question-dialog";
import AuthSlideOver from "@/components/ui/auth-slide-over";
import TaskApplicationBadge from "@/components/tasks/task-application-badge";
import { canEditTask, canApplyToTask, getDisabledReason, type TaskStatus } from "@/lib/utils/task-permissions";
// @todo FEATURE: Questions feature - commented out for future implementation
// import { canAskQuestions } from "@/lib/utils/task-permissions";
import type { ApplicationStatus } from "@/components/tasks/types";
import type { Task } from "@/server/tasks/task.types";

/**
 * Application entry from /api/applications endpoint
 */
interface UserApplicationResponse {
  id: string;
  status: ApplicationStatus;
  task: {
    id: string;
    title: string;
  };
}

/**
 * Task with customer embed for actions component
 */
interface TaskWithCustomer extends Task {
  customer?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    tasks_completed?: number;
    created_at?: string;
    preferred_language?: string;
  };
}

interface TaskActionsProps {
 task: TaskWithCustomer;
 isOwner?: boolean;
}

export default function TaskActions({ task, isOwner = false }: TaskActionsProps) {
 const t = useTranslations();
 const router = useRouter();
 const params = useParams();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const { user, profile, authenticatedFetch } = useAuth();
 const isAuthenticated = !!user && !!profile;
 const lang = params?.lang as string || 'bg';

 const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
 // @todo FEATURE: Questions feature - commented out for future implementation
 // const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false);
 const [authAction, setAuthAction] = useState<'apply' | null>(null);
 // @todo FEATURE: Questions feature - commented out for future implementation
 // const [authAction, setAuthAction] = useState<'apply' | 'question' | null>(null);
 const [userApplication, setUserApplication] = useState<{ status: ApplicationStatus } | null>(null);
 const [isLoadingApplication, setIsLoadingApplication] = useState(false);
 const [isShareCopied, setIsShareCopied] = useState(false);
 const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
 const [isWithdrawing, setIsWithdrawing] = useState(false);
 const [isMarkCompletedDialogOpen, setIsMarkCompletedDialogOpen] = useState(false);
 const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

 // Helper to get localized language name (translated to current UI locale)
 const getLanguageName = (langCode: string): string => {
  // Use profile.professional.languages.* keys which are translated per locale
  // Strip the flag emoji from the beginning (format: "🇷🇺 Russian" → "Russian")
  const key = `profile.professional.languages.${langCode}` as any;
  const translated = t(key);
  return translated.replace(/^[\p{Emoji}\s]+/u, '').trim();
 };

 // Check if there's a language barrier (task author prefers different language)
 const hasLanguageBarrier = useMemo(() => {
  const authorLanguage = task.customer?.preferred_language;
  // No barrier if author's language is Bulgarian (default) or matches current locale
  if (!authorLanguage || authorLanguage === 'bg' || authorLanguage === lang) {
   return false;
  }
  return true;
 }, [task.customer?.preferred_language, lang]);

 // @todo INTEGRATION: Fetch from user's professional profile/stats
 const withdrawalsThisMonth = 0; // Mock data
 const maxWithdrawalsPerMonth = 2; // As per PRD

 // Fetch user's application for this task
 useEffect(() => {
  if (!user || !profile) return;

  const fetchUserApplication = async () => {
   setIsLoadingApplication(true);
   try {
    const response = await authenticatedFetch(`/api/applications?status=all`);
    if (response.ok) {
     const data = await response.json();
     // Find application for this specific task
     const app = (data.applications as UserApplicationResponse[] | undefined)?.find((a) => a.task.id === task.id);
     setUserApplication(app || null);
    }
   } catch (error) {
    console.error('[TaskActions] Error fetching application:', error);
   } finally {
    setIsLoadingApplication(false);
   }
  };

  fetchUserApplication();
 }, [user, profile, task.id, authenticatedFetch]);

 // Auto-trigger dialog after successful authentication
 useEffect(() => {
  const action = searchParams.get('action');

  if (isAuthenticated && action) {
   // User just logged in and has a pending action
   if (action === 'apply') {
    setIsApplicationDialogOpen(true);
   }
   // @todo FEATURE: Questions feature - commented out for future implementation
   // else if (action === 'question') {
   //   setIsQuestionDialogOpen(true);
   // }

   // Clean up URL params using Next.js APIs
   const params = new URLSearchParams(searchParams.toString());
   params.delete('action');
   const queryString = params.toString();
   router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }
 }, [isAuthenticated, searchParams, router, pathname]);

 const handleApplyClick = () => {
  if (!isAuthenticated) {
   // Store current task URL for post-registration redirect
   // This enables: signup → profile completion → return to this task
   if (typeof window !== 'undefined') {
    localStorage.setItem('trudify_return_to', pathname);
    // Mark as professional intent - applying to tasks = professional
    localStorage.setItem('trudify_registration_intent', 'professional');
   }

   // Add URL param to trigger action after login using Next.js APIs
   const params = new URLSearchParams(searchParams.toString());
   params.set('action', 'apply');
   router.replace(`${pathname}?${params.toString()}`, { scroll: false });

   setAuthAction('apply');
   setIsAuthSlideOverOpen(true);
   return;
  }

  setIsApplicationDialogOpen(true);
 };

 // @todo FEATURE: Questions feature - commented out for future implementation
 // const handleAskQuestionClick = () => {
 //   if (!isAuthenticated) {
 //     // Add URL param to trigger action after login using Next.js APIs
 //     const params = new URLSearchParams(searchParams.toString());
 //     params.set('action');
 //     router.replace(`${pathname}?${params.toString()}`, { scroll: false });
 //
 //     setAuthAction('question');
 //     setIsAuthSlideOverOpen(true);
 //     return;
 //   }
 //   setIsQuestionDialogOpen(true);
 // };

 const handleEditClick = () => {
  router.push(`/${lang}/tasks/${task.id}/edit`);
 };

 const handleShareClick = async () => {
  const taskUrl = `${window.location.origin}/${lang}/tasks/${task.id}`;
  const shareData = {
   title: task.title,
   text: t('taskDetail.shareText'),
   url: taskUrl,
  };

  // Try to use Web Share API (native on mobile)
  if (navigator.share) {
   try {
    await navigator.share(shareData);
    toast({ title: t('taskDetail.shareSuccess') });
   } catch (error) {
    // User cancelled or error occurred
    if (error instanceof Error && error.name !== 'AbortError') {
     console.error('Error sharing:', error);
     // Fallback to clipboard
     await copyToClipboard(taskUrl);
    }
   }
  } else {
   // Fallback: Copy to clipboard
   await copyToClipboard(taskUrl);
  }
 };

 const copyToClipboard = async (text: string) => {
  try {
   await navigator.clipboard.writeText(text);
   setIsShareCopied(true);
   toast({ title: t('taskDetail.linkCopied') });

   // Reset icon after 2 seconds
   setTimeout(() => {
    setIsShareCopied(false);
   }, 2000);
  } catch (error) {
   console.error('Failed to copy:', error);
   toast({
    title: t('taskDetail.copyError'),
    variant: 'destructive',
   });
  }
 };

 const handleWithdrawClick = () => {
  setIsWithdrawDialogOpen(true);
 };

 const handleWithdrawConfirm = async (reason?: string) => {
  setIsWithdrawing(true);
  try {
   const response = await authenticatedFetch(`/api/tasks/${task.id}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     reason
    })
   });

   if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to withdraw from task');
   }

   toast({ title: t('professionalWithdraw.success') });
   setIsWithdrawDialogOpen(false);

   // Redirect to My Work page
   router.push(`/${lang}/tasks/work`);
  } catch (error) {
   console.error('Error withdrawing from task:', error);
   toast({
    title: t('professionalWithdraw.error'),
    description: error instanceof Error ? error.message : String(error),
    variant: 'destructive',
   });
  } finally {
   setIsWithdrawing(false);
  }
 };

 const handleMarkCompletedClick = () => {
  setIsMarkCompletedDialogOpen(true);
 };

 const handleMarkCompletedConfirm = async () => {
  setIsMarkingCompleted(true);
  try {
   const response = await authenticatedFetch(`/api/tasks/${task.id}/mark-complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
   });

   if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark task as completed');
   }

   toast({ title: t('taskCompletion.successMessage') });
   setIsMarkCompletedDialogOpen(false);

   // Refresh the page to show updated status
   router.refresh();
  } catch (error) {
   console.error('Error marking task as completed:', error);
   toast({
    title: t('taskCompletion.errorMessage'),
    description: error instanceof Error ? error.message : String(error),
    variant: 'destructive',
   });
  } finally {
   setIsMarkingCompleted(false);
  }
 };

 // Get task status permissions
 const taskStatus = (task.status || 'open') as TaskStatus;
 const canEdit = canEditTask(taskStatus);
 const canApply = canApplyToTask(taskStatus);
 // @todo FEATURE: Questions feature - commented out for future implementation
 // const canAsk = canAskQuestions(taskStatus);

 // Check if current user is the assigned professional
 // Note: API returns snake_case field names from database
 // Use profile.id for notification sessions (magic links), user.id for regular auth
 const currentUserId = profile?.id || user?.id;
 const isAssignedProfessional = currentUserId && task.selected_professional_id === currentUserId;

 // If assigned professional viewing their own task, show Mark Complete and Withdraw buttons
 if (isAssignedProfessional && taskStatus === 'in_progress') {
  return (
   <>
    <NextUICard className="bg-white/95 shadow-lg w-full max-w-full">
     <CardBody className="p-3 sm:p-6 space-y-3">
      <NextUIButton
       color="success"
       variant="solid"
       size="lg"
       className="w-full text-sm sm:text-base"
       startContent={<CheckCircle size={18} />}
       onPress={handleMarkCompletedClick}
       isLoading={isMarkingCompleted}
      >
       {t('taskDetail.professional.markCompleted')}
      </NextUIButton>

      <NextUIButton
       color="warning"
       variant="bordered"
       size="lg"
       className="w-full text-sm sm:text-base"
       startContent={<LogOut size={18} />}
       onPress={handleWithdrawClick}
      >
       {t('taskDetail.professional.withdraw')}
      </NextUIButton>

      <NextUIButton
       color="warning"
       variant="flat"
       size="lg"
       className="w-full text-sm sm:text-base"
       startContent={isShareCopied ? <Check size={18} /> : <Share2 size={18} />}
       onPress={handleShareClick}
      >
       {t('taskDetail.share')}
      </NextUIButton>
     </CardBody>
    </NextUICard>

    {/* Mark Completed Dialog */}
    <MarkCompletedDialog
     isOpen={isMarkCompletedDialogOpen}
     onClose={() => setIsMarkCompletedDialogOpen(false)}
     onConfirm={handleMarkCompletedConfirm}
     taskTitle={task.title}
     customerName={task.customer?.full_name || 'Customer'}
     payment={`${task.budget_max_bgn || 0} €`}
     isLoading={isMarkingCompleted}
    />

    {/* Professional Withdraw Dialog */}
    <ProfessionalWithdrawDialog
     isOpen={isWithdrawDialogOpen}
     onClose={() => setIsWithdrawDialogOpen(false)}
     onConfirm={handleWithdrawConfirm}
     taskTitle={task.title}
     customerName={task.customer?.full_name || 'Customer'}
     withdrawalsThisMonth={withdrawalsThisMonth}
     maxWithdrawalsPerMonth={maxWithdrawalsPerMonth}
     taskBudget={task.budget_max_bgn || 0}
     acceptedDate={new Date()}
    />
   </>
  );
 }

 // If owner, show Edit button and Mark Complete (when in progress)
 if (isOwner) {
  return (
   <>
    <NextUICard className="bg-white/95 shadow-lg w-full max-w-full">
     <CardBody className="p-3 sm:p-6 space-y-3">
      {/* Mark as Complete - only when task is in progress */}
      {taskStatus === 'in_progress' && (
       <NextUIButton
        color="success"
        variant="solid"
        size="lg"
        className="w-full text-sm sm:text-base"
        startContent={<CheckCircle size={18} />}
        onPress={handleMarkCompletedClick}
        isLoading={isMarkingCompleted}
       >
        {t('taskDetail.professional.markCompleted')}
       </NextUIButton>
      )}

      <Tooltip
       content={!canEdit ? getDisabledReason('edit', taskStatus) : ''}
       isDisabled={canEdit}
      >
       <div>
        <NextUIButton
         color="primary"
         variant="bordered"
         size="lg"
         className="w-full text-sm sm:text-base"
         startContent={<Edit3 size={18} />}
         onPress={handleEditClick}
         isDisabled={!canEdit}
        >
         {t('taskDetail.editTask')}
        </NextUIButton>
       </div>
      </Tooltip>

      <NextUIButton
       color="warning"
       variant="flat"
       size="lg"
       className="w-full text-sm sm:text-base"
       startContent={isShareCopied ? <Check size={18} /> : <Share2 size={18} />}
       onPress={handleShareClick}
      >
       {t('taskDetail.share')}
      </NextUIButton>
     </CardBody>
    </NextUICard>

    {/* Mark Completed Dialog */}
    <MarkCompletedDialog
     isOpen={isMarkCompletedDialogOpen}
     onClose={() => setIsMarkCompletedDialogOpen(false)}
     onConfirm={handleMarkCompletedConfirm}
     taskTitle={task.title}
     customerName={task.customer?.full_name || 'Customer'}
     payment={`${task.budget_max_bgn || 0} €`}
     isLoading={isMarkingCompleted}
    />
   </>
  );
 }

 // Non-owner view: Apply and Ask Question buttons
 return (
  <>
   <NextUICard className="bg-white/95 shadow-lg w-full max-w-full">
    <CardBody className="p-3 sm:p-6 space-y-3">
     {/* Language Barrier Info - Shown when task author prefers different language */}
     {hasLanguageBarrier && (
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
       <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
       <span className="text-xs sm:text-sm">
        {t('taskDetail.languageInfo', {
         language: getLanguageName(task.customer?.preferred_language || 'en')
        })}
       </span>
      </div>
     )}

     {/* Application Badge/Button */}
     {canApply ? (
      <TaskApplicationBadge
       status={userApplication?.status}
       onClick={handleApplyClick}
       className="w-full justify-center"
      />
     ) : (
      <Tooltip content={getDisabledReason('apply', taskStatus)}>
       <div>
        <TaskApplicationBadge
         status={userApplication?.status}
         onClick={handleApplyClick}
         className="w-full justify-center"
         isDisabled={true}
        />
       </div>
      </Tooltip>
     )}

     {/* @todo FEATURE: Questions feature - commented out for future implementation */}
     {/* <Tooltip
      content={!canAsk ? getDisabledReason('ask', taskStatus) : ''}
      isDisabled={canAsk}
     >
      <div>
       <NextUIButton
        variant="bordered"
        size="lg"
        className="w-full"
        startContent={<MessageCircle size={20} />}
        onPress={handleAskQuestionClick}
        isDisabled={!canAsk}
       >
        {t('taskDetail.askQuestion')}
       </NextUIButton>
      </div>
     </Tooltip> */}

     <NextUIButton
      color="warning"
      variant="flat"
      size="lg"
      className="w-full text-sm sm:text-base"
      startContent={isShareCopied ? <Check size={18} /> : <Share2 size={18} />}
      onPress={handleShareClick}
     >
      {t('taskDetail.share')}
     </NextUIButton>
    </CardBody>
   </NextUICard>

   {/* Application Dialog */}
   <ApplicationDialog
    isOpen={isApplicationDialogOpen}
    onClose={() => {
     setIsApplicationDialogOpen(false);
     // Refresh application status after closing
     if (user && profile) {
      authenticatedFetch(`/api/applications?status=all`)
       .then(r => r.json())
       .then(data => {
        const app = (data.applications as UserApplicationResponse[] | undefined)?.find((a) => a.task.id === task.id);
        setUserApplication(app || null);
       })
       .catch(console.error);
     }
    }}
    taskId={task.id}
    taskTitle={task.title}
    taskBudget={{
     min: task.budget_min_bgn ?? undefined,
     max: task.budget_max_bgn ?? undefined,
    }}
   />

   {/* @todo FEATURE: Questions feature - commented out for future implementation */}
   {/* Ask Question Dialog */}
   {/* <AskQuestionDialog
    isOpen={isQuestionDialogOpen}
    onClose={() => setIsQuestionDialogOpen(false)}
    taskId={task.id}
    taskTitle={task.title}
    taskAuthorId={task.authorId || 'task-author-123'}
    currentUserId={user?.id || ''}
   /> */}

   {/* Auth Slide Over */}
   <AuthSlideOver
    isOpen={isAuthSlideOverOpen}
    onClose={() => setIsAuthSlideOverOpen(false)}
    action={authAction}
   />
  </>
 );
}
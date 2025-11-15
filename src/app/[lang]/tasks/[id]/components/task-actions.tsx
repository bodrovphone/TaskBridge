'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { Share2, Edit3, XCircle, Check, LogOut } from "lucide-react";
import { Button as NextUIButton, Card as NextUICard, CardBody, Tooltip } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import ApplicationDialog from "@/components/tasks/application-dialog";
import { ProfessionalWithdrawDialog } from "@/components/tasks/professional-withdraw-dialog";
import { CancelTaskConfirmDialog } from "@/components/tasks/cancel-task-confirm-dialog";
// @todo FEATURE: Questions feature - commented out for future implementation
// import { MessageCircle } from "lucide-react";
// import AskQuestionDialog from "@/components/tasks/ask-question-dialog";
import AuthSlideOver from "@/components/ui/auth-slide-over";
import TaskApplicationBadge from "@/components/tasks/task-application-badge";
import { canEditTask, canApplyToTask, canCancelTask, getDisabledReason, type TaskStatus } from "@/lib/utils/task-permissions";
// @todo FEATURE: Questions feature - commented out for future implementation
// import { canAskQuestions } from "@/lib/utils/task-permissions";
import type { ApplicationStatus } from "@/components/tasks/types";

interface TaskActionsProps {
 task: any;
 isOwner?: boolean;
}

export default function TaskActions({ task, isOwner = false }: TaskActionsProps) {
 const { t } = useTranslation();
 const router = useRouter();
 const params = useParams();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const { user, profile } = useAuth();
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
 const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
 const [isCancelling, setIsCancelling] = useState(false);

 // @todo INTEGRATION: Fetch from user's professional profile/stats
 const withdrawalsThisMonth = 0; // Mock data
 const maxWithdrawalsPerMonth = 2; // As per PRD

 // Fetch user's application for this task
 useEffect(() => {
  if (!user || !profile) return;

  const fetchUserApplication = async () => {
   setIsLoadingApplication(true);
   try {
    const response = await fetch(`/api/applications?status=all`);
    if (response.ok) {
     const data = await response.json();
     // Find application for this specific task
     const app = data.applications?.find((a: any) => a.task.id === task.id);
     setUserApplication(app || null);
    }
   } catch (error) {
    console.error('[TaskActions] Error fetching application:', error);
   } finally {
    setIsLoadingApplication(false);
   }
  };

  fetchUserApplication();
 }, [user, profile, task.id]);

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
 //     params.set('action', 'question');
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

 const handleCancelClick = () => {
  setIsCancelDialogOpen(true);
 };

 const handleCancelConfirm = async () => {
  setIsCancelling(true);
  try {
   const response = await fetch(`/api/tasks/${task.id}/cancel`, {
    method: 'DELETE',
    credentials: 'include'
   });

   if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel task');
   }

   toast({ title: t('taskDetail.cancelSuccess') });
   setIsCancelDialogOpen(false);

   // Redirect to posted tasks page
   router.push(`/${lang}/tasks/posted`);
  } catch (error: any) {
   console.error('Error cancelling task:', error);
   toast({
    title: t('taskDetail.cancelError'),
    description: error.message,
    variant: 'destructive',
   });
  } finally {
   setIsCancelling(false);
  }
 };

 const handleShareClick = async () => {
  const taskUrl = `${window.location.origin}/${lang}/tasks/${task.id}`;
  const shareData = {
   title: task.title,
   text: t('taskDetail.shareText', 'Check out this task on Trudify'),
   url: taskUrl,
  };

  // Try to use Web Share API (native on mobile)
  if (navigator.share) {
   try {
    await navigator.share(shareData);
    toast({ title: t('taskDetail.shareSuccess', 'Shared successfully!') });
   } catch (error: any) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
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
   toast({ title: t('taskDetail.linkCopied', 'Link copied to clipboard!') });

   // Reset icon after 2 seconds
   setTimeout(() => {
    setIsShareCopied(false);
   }, 2000);
  } catch (error) {
   console.error('Failed to copy:', error);
   toast({
    title: t('taskDetail.copyError', 'Failed to copy link'),
    variant: 'destructive',
   });
  }
 };

 const handleWithdrawClick = () => {
  setIsWithdrawDialogOpen(true);
 };

 const handleWithdrawConfirm = async (reason: string, description?: string) => {
  setIsWithdrawing(true);
  try {
   const response = await fetch(`/api/tasks/${task.id}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     reason,
     description
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
  } catch (error: any) {
   console.error('Error withdrawing from task:', error);
   toast({
    title: t('professionalWithdraw.error'),
    description: error.message,
    variant: 'destructive',
   });
  } finally {
   setIsWithdrawing(false);
  }
 };

 // Get task status permissions
 const taskStatus = (task.status || 'open') as TaskStatus;
 const canEdit = canEditTask(taskStatus);
 const canApply = canApplyToTask(taskStatus);
 // @todo FEATURE: Questions feature - commented out for future implementation
 // const canAsk = canAskQuestions(taskStatus);
 const canCancel = canCancelTask(taskStatus);

 // Check if current user is the assigned professional
 const isAssignedProfessional = user && task.selectedProfessionalId === user.id;

 // If assigned professional viewing their own task, show Withdraw button
 if (isAssignedProfessional && taskStatus === 'in_progress') {
  return (
   <>
    <NextUICard className="bg-white/95 shadow-lg">
     <CardBody className="p-6 space-y-3">
      <NextUIButton
       color="warning"
       variant="bordered"
       size="lg"
       className="w-full"
       startContent={<LogOut size={20} />}
       onPress={handleWithdrawClick}
      >
       {t('taskDetail.professional.withdraw')}
      </NextUIButton>

      <NextUIButton
       color="warning"
       variant="flat"
       size="lg"
       className="w-full"
       startContent={isShareCopied ? <Check size={20} /> : <Share2 size={20} />}
       onPress={handleShareClick}
      >
       {t('taskDetail.share')}
      </NextUIButton>
     </CardBody>
    </NextUICard>

    {/* Professional Withdraw Dialog */}
    <ProfessionalWithdrawDialog
     isOpen={isWithdrawDialogOpen}
     onClose={() => setIsWithdrawDialogOpen(false)}
     onConfirm={handleWithdrawConfirm}
     taskTitle={task.title}
     customerName={task.customer?.name || task.customerName || 'Customer'}
     withdrawalsThisMonth={withdrawalsThisMonth}
     maxWithdrawalsPerMonth={maxWithdrawalsPerMonth}
     taskBudget={task.budgetMax || task.budget || 0}
     acceptedDate={task.acceptedAt ? new Date(task.acceptedAt) : new Date()}
    />
   </>
  );
 }

 // If owner, show Edit and Cancel buttons instead of Apply/Question
 if (isOwner) {
  return (
   <>
    <NextUICard className="bg-white/95 shadow-lg">
     <CardBody className="p-6 space-y-3">
      <Tooltip
       content={!canEdit ? getDisabledReason('edit', taskStatus) : ''}
       isDisabled={canEdit}
      >
       <div>
        <NextUIButton
         color="primary"
         variant="bordered"
         size="lg"
         className="w-full"
         startContent={<Edit3 size={20} />}
         onPress={handleEditClick}
         isDisabled={!canEdit}
        >
         {t('taskDetail.editTask')}
        </NextUIButton>
       </div>
      </Tooltip>

      <Tooltip
       content={!canCancel ? getDisabledReason('cancel', taskStatus) : ''}
       isDisabled={canCancel}
      >
       <div>
        <NextUIButton
         color="danger"
         variant="bordered"
         size="lg"
         className="w-full"
         startContent={<XCircle size={20} />}
         onPress={handleCancelClick}
         isDisabled={!canCancel}
        >
         {t('taskDetail.cancelTask')}
        </NextUIButton>
       </div>
      </Tooltip>

      <NextUIButton
       color="warning"
       variant="flat"
       size="lg"
       className="w-full"
       startContent={isShareCopied ? <Check size={20} /> : <Share2 size={20} />}
       onPress={handleShareClick}
      >
       {t('taskDetail.share')}
      </NextUIButton>
     </CardBody>
    </NextUICard>

    {/* Cancel Task Confirmation Dialog */}
    <CancelTaskConfirmDialog
     isOpen={isCancelDialogOpen}
     onClose={() => setIsCancelDialogOpen(false)}
     onConfirm={handleCancelConfirm}
     taskTitle={task.title}
     applicationsCount={task.applicationsCount || 0}
     isLoading={isCancelling}
    />
   </>
  );
 }

 // Non-owner view: Apply and Ask Question buttons
 return (
  <>
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-6 space-y-3">
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
      className="w-full"
      startContent={isShareCopied ? <Check size={20} /> : <Share2 size={20} />}
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
      fetch(`/api/applications?status=all`)
       .then(r => r.json())
       .then(data => {
        const app = data.applications?.find((a: any) => a.task.id === task.id);
        setUserApplication(app || null);
       })
       .catch(console.error);
     }
    }}
    taskId={task.id}
    taskTitle={task.title}
    taskBudget={{
     min: task.budgetMin || task.budget_min_bgn || task.budget,
     max: task.budgetMax || task.budget_max_bgn || task.budget,
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
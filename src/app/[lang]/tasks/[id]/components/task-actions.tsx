'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { MessageCircle, Share2, Edit3, XCircle } from "lucide-react";
import { Button as NextUIButton, Card as NextUICard, CardBody } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/features/auth";
import ApplicationDialog from "@/components/tasks/application-dialog";
import AskQuestionDialog from "@/components/tasks/ask-question-dialog";
import AuthSlideOver from "@/components/ui/auth-slide-over";
import TaskApplicationBadge from "@/components/tasks/task-application-badge";
import { getUserApplication } from "@/components/tasks/mock-submit";

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
 const lang = params?.lang as string || 'en';

 const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
 const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false);
 const [authAction, setAuthAction] = useState<'apply' | 'question' | null>(null);

 // @todo FEATURE: Replace mock with real API call to check user's application
 const userId = profile?.id || 'mock-user-123';
 const userApplication = getUserApplication(task.id, userId);

 // Auto-trigger dialog after successful authentication
 useEffect(() => {
  const action = searchParams.get('action');

  if (isAuthenticated && action) {
   // User just logged in and has a pending action
   if (action === 'apply') {
    setIsApplicationDialogOpen(true);
   } else if (action === 'question') {
    setIsQuestionDialogOpen(true);
   }

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

 const handleAskQuestionClick = () => {
  if (!isAuthenticated) {
   // Add URL param to trigger action after login using Next.js APIs
   const params = new URLSearchParams(searchParams.toString());
   params.set('action', 'question');
   router.replace(`${pathname}?${params.toString()}`, { scroll: false });

   setAuthAction('question');
   setIsAuthSlideOverOpen(true);
   return;
  }
  setIsQuestionDialogOpen(true);
 };

 const handleEditClick = () => {
  router.push(`/${lang}/tasks/${task.id}/edit`);
 };

 const handleCancelClick = () => {
  // @todo FEATURE: Implement cancel task functionality
  // For now, just show an alert
  if (window.confirm(t('taskDetail.confirmCancel', 'Are you sure you want to cancel this task?'))) {
   alert(t('taskDetail.cancelSuccess', 'Task cancellation feature coming soon!'));
  }
 };

 // If owner, show Edit and Cancel buttons instead of Apply/Question
 if (isOwner) {
  return (
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-6 space-y-3">
     <NextUIButton
      color="primary"
      variant="bordered"
      size="lg"
      className="w-full"
      startContent={<Edit3 size={20} />}
      onPress={handleEditClick}
     >
      {t('taskDetail.editTask')}
     </NextUIButton>

     <NextUIButton
      color="danger"
      variant="bordered"
      size="lg"
      className="w-full"
      startContent={<XCircle size={20} />}
      onPress={handleCancelClick}
     >
      {t('taskDetail.cancelTask')}
     </NextUIButton>

     <NextUIButton
      color="warning"
      variant="flat"
      size="lg"
      className="w-full"
      startContent={<Share2 size={20} />}
     >
      {t('taskDetail.share')}
     </NextUIButton>
    </CardBody>
   </NextUICard>
  );
 }

 // Non-owner view: Apply and Ask Question buttons
 return (
  <>
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-6 space-y-3">
     {/* Application Badge/Button */}
     <TaskApplicationBadge
      status={userApplication?.status}
      onClick={handleApplyClick}
      className="w-full justify-center"
     />

     <NextUIButton
      variant="bordered"
      size="lg"
      className="w-full"
      startContent={<MessageCircle size={20} />}
      onPress={handleAskQuestionClick}
     >
      {t('taskDetail.askQuestion')}
     </NextUIButton>

     <NextUIButton
      color="warning"
      variant="flat"
      size="lg"
      className="w-full"
      startContent={<Share2 size={20} />}
     >
      {t('taskDetail.share')}
     </NextUIButton>
    </CardBody>
   </NextUICard>

   {/* Application Dialog */}
   <ApplicationDialog
    isOpen={isApplicationDialogOpen}
    onClose={() => setIsApplicationDialogOpen(false)}
    taskId={task.id}
    taskTitle={task.title}
    taskBudget={{
     min: task.budgetMin,
     max: task.budgetMax,
    }}
   />

   {/* Ask Question Dialog */}
   <AskQuestionDialog
    isOpen={isQuestionDialogOpen}
    onClose={() => setIsQuestionDialogOpen(false)}
    taskId={task.id}
    taskTitle={task.title}
    taskAuthorId={task.authorId || 'task-author-123'}
    currentUserId={userId}
   />

   {/* Auth Slide Over */}
   <AuthSlideOver
    isOpen={isAuthSlideOverOpen}
    onClose={() => setIsAuthSlideOverOpen(false)}
    action={authAction}
   />
  </>
 );
}
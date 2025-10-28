'use client'

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { Button as NextUIButton, Card as NextUICard, CardBody } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/features/auth";
import ApplicationDialog from "@/components/tasks/application-dialog";
import AskQuestionDialog from "@/components/tasks/ask-question-dialog";
import AuthSlideOver from "./auth-slide-over";
import TaskApplicationBadge from "@/components/tasks/task-application-badge";
import { getUserApplication } from "@/components/tasks/mock-submit";

interface TaskActionsProps {
 task: any;
}

export default function TaskActions({ task }: TaskActionsProps) {
 const { t } = useTranslation();
 const { user, profile } = useAuth();
 const isAuthenticated = !!user && !!profile;

 const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
 const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false);
 const [authAction, setAuthAction] = useState<'apply' | 'question' | null>(null);

 // @todo FEATURE: Replace mock with real API call to check user's application
 const userId = profile?.id || 'mock-user-123';
 const userApplication = getUserApplication(task.id, userId);

 const handleApplyClick = () => {
  if (!isAuthenticated) {
   setAuthAction('apply');
   setIsAuthSlideOverOpen(true);
   return;
  }
  setIsApplicationDialogOpen(true);
 };

 const handleAskQuestionClick = () => {
  if (!isAuthenticated) {
   setAuthAction('question');
   setIsAuthSlideOverOpen(true);
   return;
  }
  setIsQuestionDialogOpen(true);
 };

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
      variant="light"
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
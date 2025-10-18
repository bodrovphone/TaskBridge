'use client'

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { Button as NextUIButton, Card as NextUICard, CardBody } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import ApplicationDialog from "@/components/tasks/application-dialog";
import TaskApplicationBadge from "@/components/tasks/task-application-badge";
import { getUserApplication } from "@/components/tasks/mock-submit";

interface TaskActionsProps {
 task: any;
}

export default function TaskActions({ task }: TaskActionsProps) {
 const { t } = useTranslation();
 const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

 // Mock user ID (in real app, get from auth context)
 const userId = 'mock-user-123';

 // Check if user has already applied
 const userApplication = getUserApplication(task.id, userId);

 return (
  <>
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-6 space-y-3">
     {/* Application Badge/Button */}
     <TaskApplicationBadge
      status={userApplication?.status}
      onClick={() => setIsApplicationDialogOpen(true)}
      className="w-full justify-center"
     />

     <NextUIButton
      variant="bordered"
      size="lg"
      className="w-full"
      startContent={<MessageCircle size={20} />}
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
  </>
 );
}
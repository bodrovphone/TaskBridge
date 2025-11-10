'use client'

// @todo REFACTORING: Extract mock data to separate data provider or hook
// - Move mockQuestions to shared data service (~20 lines) ✅ DONE
// - Create useTaskActivity hook for state management (~20 lines)
// Target: Reduce from 150 lines to ~90 lines

import { useState, useEffect, useRef } from "react";
import { Card as NextUICard, CardBody, Tabs, Tab } from "@nextui-org/react";
import { User } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { ApplicationsSection, TaskInProgressState } from "./sections";
// @todo FEATURE: Questions feature - commented out for future implementation
// import { MessageCircle } from "lucide-react";
// import { QuestionsSection } from "./sections";
import ApplicationDetail from '@/components/tasks/application-detail';
import AcceptApplicationDialog from '@/components/tasks/accept-application-dialog';
import RejectApplicationDialog from '@/components/tasks/reject-application-dialog';
import { Application } from '@/types/applications';
// @todo FEATURE: Questions feature - commented out for future implementation
// import { getTaskQuestions, updateQuestionAnswer, getRelativeTime } from '@/components/tasks/mock-questions';
// import type { Question } from '@/types/questions';
import { getRelativeTime } from '@/components/tasks/mock-questions';
import { normalizeCategoryKeys } from '@/lib/utils/categories';
import { useToast } from '@/hooks/use-toast';

interface TaskActivityProps {
  taskId: string;
}

export default function TaskActivity({ taskId }: TaskActivityProps) {
 const { t, i18n } = useTranslation();
 const { toast } = useToast();
 const [selectedTab, setSelectedTab] = useState("applications");
 const applicationsRef = useRef<HTMLDivElement>(null);

 // State for applications - fetch from API
 const [applications, setApplications] = useState<Application[]>([]);
 const [isLoadingApplications, setIsLoadingApplications] = useState(true);
 const [applicationsError, setApplicationsError] = useState<string | null>(null);

 // @todo FEATURE: Questions feature - commented out for future implementation
 // State for questions - load from mock service
 // const [questions, setQuestions] = useState<Question[]>([]);
 // const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

 // Fetch applications from API
 useEffect(() => {
  const fetchApplications = async () => {
   setIsLoadingApplications(true);
   setApplicationsError(null);

   try {
    const response = await fetch(`/api/tasks/${taskId}/applications`);

    if (!response.ok) {
     if (response.status === 403) {
      setApplicationsError('You do not have permission to view these applications');
     } else if (response.status === 404) {
      setApplicationsError('Task not found');
     } else {
      setApplicationsError('Failed to load applications');
     }
     setIsLoadingApplications(false);
     return;
    }

    const data = await response.json();

    // Map API response to Application type
    const mappedApplications: Application[] = (data.applications || []).map((app: any) => ({
     id: app.id,
     taskId: taskId,
     professional: {
      id: app.professional?.id || '',
      name: app.professional?.full_name || 'Unknown',
      avatar: app.professional?.avatar_url || null,
      rating: app.professional?.average_rating || 0,
      completedTasks: app.professional?.tasks_completed || 0,
      skills: normalizeCategoryKeys(app.professional?.service_categories),
      hourlyRate: app.professional?.hourly_rate_bgn || null,
      bio: app.professional?.bio || null,
      city: app.professional?.city || null,
     },
     proposedPrice: app.proposed_price_bgn,
     currency: 'BGN',  // Bulgarian Lev
     timeline: app.estimated_duration_hours ? `${app.estimated_duration_hours}h` : t('common.flexible', 'Flexible'),
     message: app.message,
     status: app.status,
     createdAt: new Date(app.created_at),
     updatedAt: new Date(app.updated_at),
     rejectionReason: app.rejection_reason || undefined,
     withdrawnAt: app.withdrawn_at ? new Date(app.withdrawn_at) : undefined,
     withdrawalReason: app.withdrawal_reason || undefined,
    }));

    setApplications(mappedApplications);
   } catch (error) {
    console.error('[TaskActivity] Error fetching applications:', error);
    setApplicationsError('Failed to load applications');
   } finally {
    setIsLoadingApplications(false);
   }
  };

  fetchApplications();
 }, [taskId]);

 // @todo FEATURE: Questions feature - commented out for future implementation
 // Load questions when component mounts or taskId changes
 // useEffect(() => {
 //  setIsLoadingQuestions(true);
 //  // Simulate loading delay
 //  setTimeout(() => {
 //   const taskQuestions = getTaskQuestions(taskId);
 //   setQuestions(taskQuestions);
 //   setIsLoadingQuestions(false);
 //  }, 500);
 // }, [taskId]);

 // Handle URL hash navigation (e.g., #applications)
 useEffect(() => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'applications') {
   setSelectedTab('applications');
   // Scroll to the applications section using ref
   applicationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 }, []);

 // State for modals
 const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
 const [isDetailOpen, setIsDetailOpen] = useState(false);
 const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
 const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

 // Handlers
 const handleViewDetails = (id: string) => {
  const app = applications.find(a => a.id === id);
  if (app) {
   setSelectedApplication(app);
   setIsDetailOpen(true);
  }
 };

 const handleAcceptClick = (id: string) => {
  const app = applications.find(a => a.id === id);
  if (app) {
   setSelectedApplication(app);
   setIsAcceptDialogOpen(true);
  }
 };

 const handleRejectClick = (id: string) => {
  const app = applications.find(a => a.id === id);
  if (app) {
   setSelectedApplication(app);
   setIsRejectDialogOpen(true);
  }
 };

 const handleAcceptConfirm = async (id: string) => {
  try {
   // Call API to accept application
   const response = await fetch(`/api/applications/${id}/accept`, {
    method: 'PATCH'
   });

   if (!response.ok) {
    const error = await response.json();
    toast({
     title: t('common.error', 'Error'),
     description: error.error || t('common.error', 'An error occurred'),
     variant: 'destructive'
    });
    return;
   }

   // Get the accepted application for the toast
   const acceptedApp = applications.find(app => app.id === id);

   // Update application status: accept selected, reject all others
   setApplications(prev => prev.map(app =>
    app.id === id
     ? { ...app, status: 'accepted' as const, updatedAt: new Date() }
     : app.status === 'pending'
      ? { ...app, status: 'rejected' as const, updatedAt: new Date() }
      : app
   ));

   setIsAcceptDialogOpen(false);
   setIsDetailOpen(false);

   // Show success toast
   toast({
    title: t('acceptApplication.successTitle', '🎉 Application Accepted!'),
    description: t('acceptApplication.successDescription', 'You are now working with {{name}}. All other applications have been automatically rejected.', {
     name: acceptedApp?.professional.name || 'the professional'
    }),
    variant: 'default'
   });

   console.log('✅ Application accepted:', id);
  } catch (error) {
   console.error('[TaskActivity] Error accepting application:', error);
   toast({
    title: t('common.error', 'Error'),
    description: t('common.error', 'An error occurred'),
    variant: 'destructive'
   });
  }
 };

 const handleRejectConfirm = async (id: string, reason?: string) => {
  try {
   // Call API to reject application
   const response = await fetch(`/api/applications/${id}/reject`, {
    method: 'PATCH',
    headers: {
     'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
   });

   if (!response.ok) {
    const error = await response.json();
    alert(error.error || t('common.error', 'An error occurred'));
    return;
   }

   // Update application status
   setApplications(prev => prev.map(app =>
    app.id === id
     ? { ...app, status: 'rejected' as const, rejectionReason: reason, updatedAt: new Date() }
     : app
   ));

   setIsRejectDialogOpen(false);
   setIsDetailOpen(false);
   console.log('❌ Application rejected:', id, 'Reason:', reason || 'Not specified');
  } catch (error) {
   console.error('[TaskActivity] Error rejecting application:', error);
   alert(t('common.error', 'An error occurred'));
  }
 };

 // @todo FEATURE: Questions feature - commented out for future implementation
 // const handleReplyToQuestion = (questionId: string, reply: string) => {
 //  // Update the answer in mock storage
 //  updateQuestionAnswer(taskId, questionId, 'task-author-123', reply);
 //
 //  // Reload questions to reflect the change
 //  const updatedQuestions = getTaskQuestions(taskId);
 //  setQuestions(updatedQuestions);
 //
 //  console.log("Reply posted to question:", questionId);
 // };

 // Check if there's an accepted application
 const acceptedApplication = applications.find(app => app.status === 'accepted');

 return (
  <div id="applications" ref={applicationsRef} className="w-full overflow-hidden">
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-3 sm:p-6">
     <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
      {t('taskDetail.activity')}
     </h3>

     <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => {
       setSelectedTab(key as string);
       // @todo FEATURE: Questions feature - commented out for future implementation
       // Reload questions when switching to questions tab
       // if (key === 'questions') {
       //  const updatedQuestions = getTaskQuestions(taskId);
       //  setQuestions(updatedQuestions);
       // }
      }}
      className="w-full overflow-hidden"
     >
      <Tab
       key="applications"
       title={
        <div className="flex items-center gap-1.5 sm:gap-2">
         <User size={14} className="sm:w-4 sm:h-4" />
         <span className="text-xs sm:text-sm">{t('taskDetail.applications')} ({applications.length})</span>
        </div>
       }
      >
       <div className="mt-3 sm:mt-4 overflow-hidden">
        {isLoadingApplications ? (
         <div className="flex justify-center py-8">
          <div className="text-gray-500">{t('common.loading', 'Loading...')}</div>
         </div>
        ) : applicationsError ? (
         <div className="flex justify-center py-8">
          <div className="text-red-500">{applicationsError}</div>
         </div>
        ) : acceptedApplication ? (
         <TaskInProgressState acceptedApplication={acceptedApplication} />
        ) : (
         <ApplicationsSection
          applications={applications.map(app => ({
           id: app.id,
           user: {
            name: app.professional.name,
            avatar: app.professional.avatar || '',
            rating: app.professional.rating,
            completedTasks: app.professional.completedTasks,
            skills: app.professional.skills
           },
           proposal: app.message,
           price: `${app.proposedPrice} ${app.currency}`,
           timeline: app.timeline,
           timestamp: getRelativeTime(app.createdAt, i18n.language),
           status: app.status
          }))}
          onAcceptApplication={handleAcceptClick}
          onRejectApplication={handleRejectClick}
          onViewDetails={handleViewDetails}
         />
        )}
       </div>
      </Tab>

      {/* @todo FEATURE: Questions feature - commented out for future implementation */}
      {/* <Tab
       key="questions"
       title={
        <div className="flex items-center gap-1.5 sm:gap-2">
         <MessageCircle size={14} className="sm:w-4 sm:h-4" />
         <span className="text-xs sm:text-sm">{t('taskDetail.questions')} ({questions.length})</span>
        </div>
       }
      >
       <QuestionsSection
        questions={questions.map(q => ({
         id: q.id,
         user: {
          name: q.asker.name,
          avatar: q.asker.avatar,
          rating: q.asker.rating,
          completedTasks: q.asker.completedTasks,
         },
         question: q.questionText,
         timestamp: getRelativeTime(q.createdAt, i18n.language),
         reply: q.answer?.answerText || null,
        }))}
        onReplyToQuestion={handleReplyToQuestion}
        isLoading={isLoadingQuestions}
       />
      </Tab> */}
     </Tabs>
    </CardBody>
   </NextUICard>

   {/* Modals */}
   {/* Application Detail Modal */}
   <ApplicationDetail
    application={selectedApplication}
    isOpen={isDetailOpen}
    onClose={() => setIsDetailOpen(false)}
    onAccept={handleAcceptClick}
    onReject={handleRejectClick}
   />

   {/* Accept Dialog */}
   <AcceptApplicationDialog
    application={selectedApplication}
    isOpen={isAcceptDialogOpen}
    onClose={() => setIsAcceptDialogOpen(false)}
    onConfirm={handleAcceptConfirm}
   />

   {/* Reject Dialog */}
   <RejectApplicationDialog
    application={selectedApplication}
    isOpen={isRejectDialogOpen}
    onClose={() => setIsRejectDialogOpen(false)}
    onConfirm={handleRejectConfirm}
   />
  </div>
 );
}
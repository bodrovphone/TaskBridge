'use client'

// @todo REFACTORING: Extract mock data to separate data provider or hook
// - Move mockQuestions to shared data service (~20 lines) ✅ DONE
// - Create useTaskActivity hook for state management (~20 lines)
// Target: Reduce from 150 lines to ~90 lines

import { useState, useEffect, useRef } from "react";
import { Card as NextUICard, CardBody, Tabs, Tab } from "@nextui-org/react";
import { MessageCircle, User } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { QuestionsSection } from "./sections";
import ApplicationsList from '@/components/tasks/applications-list';
import ApplicationDetail from '@/components/tasks/application-detail';
import AcceptApplicationDialog from '@/components/tasks/accept-application-dialog';
import RejectApplicationDialog from '@/components/tasks/reject-application-dialog';
import { getApplicationsForTask } from '@/lib/mock-data/applications';
import { Application } from '@/types/applications';
import { getTaskQuestions, updateQuestionAnswer, getRelativeTime } from '@/components/tasks/mock-questions';
import type { Question } from '@/types/questions';

interface TaskActivityProps {
  taskId: string;
  initialApplicationId?: string;  // Auto-open application detail for this ID
}

export default function TaskActivity({ taskId, initialApplicationId }: TaskActivityProps) {
 const { t, i18n } = useTranslation();
 const [selectedTab, setSelectedTab] = useState("applications");
 const applicationsRef = useRef<HTMLDivElement>(null);

 // State for applications - filter by task ID
 const [applications, setApplications] = useState<Application[]>(getApplicationsForTask(taskId));

 // State for questions - load from mock service
 const [questions, setQuestions] = useState<Question[]>([]);
 const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

 // Load questions when component mounts or taskId changes
 useEffect(() => {
  setIsLoadingQuestions(true);
  // Simulate loading delay
  setTimeout(() => {
   const taskQuestions = getTaskQuestions(taskId);
   setQuestions(taskQuestions);
   setIsLoadingQuestions(false);
  }, 500);
 }, [taskId]);

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

 // Auto-open application detail dialog if initialApplicationId is provided
 useEffect(() => {
  if (initialApplicationId) {
   const app = applications.find(a => a.id === initialApplicationId);
   if (app) {
    setSelectedApplication(app);
    setIsDetailOpen(true);
    // Ensure we're on the applications tab
    setSelectedTab("applications");
   }
  }
 }, [initialApplicationId, applications]);

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

 const handleAcceptConfirm = (id: string) => {
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
  console.log('✅ Application accepted:', id);
 };

 const handleRejectConfirm = (id: string, reason?: string) => {
  // Update application status
  setApplications(prev => prev.map(app =>
   app.id === id
    ? { ...app, status: 'rejected' as const, rejectionReason: reason, updatedAt: new Date() }
    : app
  ));
  setIsRejectDialogOpen(false);
  setIsDetailOpen(false);
  console.log('❌ Application rejected:', id, 'Reason:', reason || 'Not specified');
 };

 const handleReplyToQuestion = (questionId: string, reply: string) => {
  // Update the answer in mock storage
  updateQuestionAnswer(taskId, questionId, 'task-author-123', reply);

  // Reload questions to reflect the change
  const updatedQuestions = getTaskQuestions(taskId);
  setQuestions(updatedQuestions);

  console.log("Reply posted to question:", questionId);
 };

 return (
  <div id="applications" ref={applicationsRef}>
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-6">
     <h3 className="text-lg font-bold text-gray-900 mb-4">
      {t('taskDetail.activity')}
     </h3>

     <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => {
       setSelectedTab(key as string);
       // Reload questions when switching to questions tab
       if (key === 'questions') {
        const updatedQuestions = getTaskQuestions(taskId);
        setQuestions(updatedQuestions);
       }
      }}
      className="w-full"
     >
      <Tab
       key="applications"
       title={
        <div className="flex items-center gap-2">
         <User size={16} />
         <span>{t('taskDetail.applications')} ({applications.length})</span>
        </div>
       }
      >
       <div className="mt-4">
        <ApplicationsList
         applications={applications}
         onAccept={handleAcceptClick}
         onReject={handleRejectClick}
         onViewDetails={handleViewDetails}
        />
       </div>
      </Tab>

      <Tab
       key="questions"
       title={
        <div className="flex items-center gap-2">
         <MessageCircle size={16} />
         <span>{t('taskDetail.questions')} ({questions.length})</span>
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
      </Tab>
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
'use client'

// @todo REFACTORING: Extract mock data to separate data provider or hook
// - Move mockQuestions to shared data service (~20 lines)
// - Create useTaskActivity hook for state management (~20 lines)
// Target: Reduce from 150 lines to ~90 lines

import { useState, useEffect } from "react";
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

interface TaskActivityProps {
  taskId: string;
  initialApplicationId?: string;  // Auto-open application detail for this ID
}

// Mock data - in real app this would come from props or API
const mockQuestions = [
 {
  id: "q1",
  user: {
   name: "Петър Георгиев",
   avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
   rating: 4.8,
   completedTasks: 15
  },
  question: "Колко квадратни метра точно трябва да бъдат почистени? И включва ли почистването на прозорци?",
  timestamp: "преди 2 часа",
  reply: "Включва около 80 кв.м. и да, прозорците са включени в цената."
 },
 {
  id: "q2", 
  user: {
   name: "Анна Николова",
   avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
   rating: 4.9,
   completedTasks: 23
  },
  question: "Имате ли предпочитания за почистващи препарати? Аз работя с екологични продукти.",
  timestamp: "преди 4 часа",
  reply: null
 },
 {
  id: "q3",
  user: {
   name: "Димитър Стоянов", 
   avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
   rating: 4.7,
   completedTasks: 31
  },
  question: "В коя част от деня предпочитате да се извърши почистването?",
  timestamp: "преди 1 ден",
  reply: "Предпочитам сутрин между 9 и 11 часа."
 }
];

export default function TaskActivity({ taskId, initialApplicationId }: TaskActivityProps) {
 const { t } = useTranslation();
 const [selectedTab, setSelectedTab] = useState("applications");

 // State for applications - filter by task ID
 const [applications, setApplications] = useState<Application[]>(getApplicationsForTask(taskId));

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
  console.log("Reply to question:", questionId, reply);
  // TODO: Implement reply logic
 };

 return (
  <>
   <NextUICard className="bg-white/95 shadow-lg">
    <CardBody className="p-6">
     <h3 className="text-lg font-bold text-gray-900 mb-4">
      {t('taskDetail.activity')}
     </h3>

     <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => setSelectedTab(key as string)}
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
         <span>{t('taskDetail.questions')} ({mockQuestions.length})</span>
        </div>
       }
      >
       <QuestionsSection
        questions={mockQuestions}
        onReplyToQuestion={handleReplyToQuestion}
       />
      </Tab>
     </Tabs>
    </CardBody>
   </NextUICard>

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
  </>
 );
}
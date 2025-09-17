'use client'

// @todo REFACTORING: Extract mock data to separate data provider or hook
// - Move mockQuestions and mockApplications to shared data service (~40 lines)
// - Create useTaskActivity hook for state management (~20 lines) 
// Target: Reduce from 150 lines to ~90 lines

import { useState } from "react";
import { Card as NextUICard, CardBody, Tabs, Tab } from "@nextui-org/react";
import { MessageCircle, User } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { ApplicationsSection, QuestionsSection } from "./sections";

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

const mockApplications = [
  {
    id: "a1",
    user: {
      name: "Мария Петрова",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 4.9,
      completedTasks: 67,
      specializations: ["Домашно почистване", "Дълбоко почистване"]
    },
    proposal: "Здравейте! Имам 5 години опит в професионалното почистване. Мога да завърша работата за 2 дни с гаранция за качеството. Разполагам с всички необходими препарати и оборудване.",
    price: "120 лв",
    timeline: "2 дни",
    timestamp: "преди 1 час",
    status: "pending"
  },
  {
    id: "a2",
    user: {
      name: "Георги Иванов",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", 
      rating: 4.6,
      completedTasks: 43,
      specializations: ["Почистване", "Поддръжка"]
    },
    proposal: "Добър ден! Предлагам професионално почистване на изгодна цена. Имам застраховка и всички разрешения. Мога да започна още утре.",
    price: "95 лв",
    timeline: "1 ден",
    timestamp: "преди 3 часа",
    status: "pending"
  },
  {
    id: "a3",
    user: {
      name: "Елена Димитрова",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      rating: 5.0,
      completedTasks: 89,
      specializations: ["Екологично почистване", "Домашна помощ"]
    },
    proposal: "Здравейте! Специализирам се в екологично почистване с био препарати. Работя внимателно и с голямо внимание към детайлите. Мога да предоставя референции от предишни клиенти.",
    price: "140 лв",
    timeline: "1.5 дни", 
    timestamp: "преди 5 часа",
    status: "pending"
  }
];

export default function TaskActivity() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("applications");

  const handleAcceptApplication = (applicationId: string) => {
    console.log("Accept application:", applicationId);
    // TODO: Implement accept logic
  };

  const handleRejectApplication = (applicationId: string) => {
    console.log("Reject application:", applicationId);
    // TODO: Implement reject logic
  };

  const handleReplyToQuestion = (questionId: string, reply: string) => {
    console.log("Reply to question:", questionId, reply);
    // TODO: Implement reply logic
  };

  return (
    <NextUICard className="bg-white/95 backdrop-blur-sm shadow-lg">
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
                <span>{t('taskDetail.applications')} ({mockApplications.length})</span>
              </div>
            }
          >
            <ApplicationsSection
              applications={mockApplications}
              onAcceptApplication={handleAcceptApplication}
              onRejectApplication={handleRejectApplication}
            />
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
  );
}
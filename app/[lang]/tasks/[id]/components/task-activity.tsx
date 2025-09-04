'use client'

import { useState } from "react";
import { Card as NextUICard, CardBody, Avatar, Button as NextUIButton, Chip, Tabs, Tab } from "@nextui-org/react";
import { MessageCircle, User, CheckCircle, Clock, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';

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
    status: "pending" // pending, accepted, rejected
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

  const handleReplyToQuestion = (questionId: string) => {
    console.log("Reply to question:", questionId);
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
            <div className="space-y-4 mt-4">
              {mockApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={application.user.avatar}
                        name={application.user.name}
                        className="w-12 h-12"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{application.user.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 fill-current" size={12} />
                            <span>{application.user.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="text-green-500" size={12} />
                            <span>{application.user.completedTasks} {t('taskDetail.tasks')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{application.timestamp}</div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {application.user.specializations.map((spec) => (
                      <Chip key={spec} size="sm" variant="flat" color="primary">
                        {spec}
                      </Chip>
                    ))}
                  </div>

                  {/* Proposal */}
                  <p className="text-gray-700 mb-3">{application.proposal}</p>

                  {/* Price and Timeline */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">{t('taskDetail.price')}</span>
                        <span className="font-semibold text-green-600">{application.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{application.timeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {application.status === "pending" && (
                    <div className="flex gap-2">
                      <NextUIButton
                        color="success"
                        size="sm"
                        variant="solid"
                        onClick={() => handleAcceptApplication(application.id)}
                      >
                        {t('taskDetail.accept')}
                      </NextUIButton>
                      <NextUIButton
                        color="danger"
                        size="sm"
                        variant="bordered"
                        onClick={() => handleRejectApplication(application.id)}
                      >
                        {t('taskDetail.reject')}
                      </NextUIButton>
                      <NextUIButton
                        color="primary"
                        size="sm"
                        variant="light"
                      >
                        {t('taskDetail.message')}
                      </NextUIButton>
                    </div>
                  )}
                </div>
              ))}
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
            <div className="space-y-4 mt-4">
              {mockQuestions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={question.user.avatar}
                        name={question.user.name}
                        className="w-10 h-10"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{question.user.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 fill-current" size={10} />
                            <span>{question.user.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{question.user.completedTasks} {t('taskDetail.tasks')}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{question.timestamp}</span>
                  </div>

                  {/* Question */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-gray-700">{question.question}</p>
                  </div>

                  {/* Reply */}
                  {question.reply ? (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-blue-900">{t('taskDetail.yourReply')}</span>
                      </div>
                      <p className="text-blue-800">{question.reply}</p>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <NextUIButton
                        color="primary"
                        size="sm"
                        variant="bordered"
                        onClick={() => handleReplyToQuestion(question.id)}
                      >
                        {t('taskDetail.reply')}
                      </NextUIButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </NextUICard>
  );
}
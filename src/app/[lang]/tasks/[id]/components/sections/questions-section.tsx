'use client'

import { Avatar, Button as NextUIButton, Textarea } from "@heroui/react";
import { MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface Question {
 id: string;
 user: {
  name: string;
  avatar: string;
  rating: number;
  completedTasks: number;
 };
 question: string;
 timestamp: string;
 reply: string | null;
}

interface QuestionsSectionProps {
 questions: Question[];
 onReplyToQuestion: (id: string, reply: string) => void;
}

export default function QuestionsSection({ questions, onReplyToQuestion }: QuestionsSectionProps) {
 const { t } = useTranslation();
 const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
 const [showReplyForm, setShowReplyForm] = useState<Record<string, boolean>>({});

 const handleReplySubmit = (questionId: string) => {
  const reply = replyTexts[questionId];
  if (reply?.trim()) {
   onReplyToQuestion(questionId, reply);
   setReplyTexts(prev => ({ ...prev, [questionId]: "" }));
   setShowReplyForm(prev => ({ ...prev, [questionId]: false }));
  }
 };

 return (
  <div className="space-y-4 mt-4">
   {questions.map((question) => (
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
        <div className="flex items-center gap-2 text-sm text-gray-600">
         <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{question.user.rating}</span>
         </div>
         <span>•</span>
         <span>{question.user.completedTasks} {t('taskDetail.completedTasks')}</span>
        </div>
       </div>
      </div>
      <span className="text-sm text-gray-500">{question.timestamp}</span>
     </div>

     {/* Question */}
     <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <p className="text-gray-800">{question.question}</p>
     </div>

     {/* Reply */}
     {question.reply ? (
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 mb-3">
       <p className="text-blue-900 font-medium mb-1">{t('taskDetail.yourReply')}:</p>
       <p className="text-blue-800">{question.reply}</p>
      </div>
     ) : (
      <>
       {showReplyForm[question.id] ? (
        <div className="space-y-3">
         <Textarea
          value={replyTexts[question.id] || ""}
          onChange={(e) => setReplyTexts(prev => ({ ...prev, [question.id]: e.target.value }))}
          placeholder={t('taskDetail.writeReply')}
          minRows={3}
          className="w-full"
         />
         <div className="flex gap-2">
          <NextUIButton
           color="primary"
           size="sm"
           onClick={() => handleReplySubmit(question.id)}
           isDisabled={!replyTexts[question.id]?.trim()}
          >
           {t('taskDetail.sendReply')}
          </NextUIButton>
          <NextUIButton
           variant="bordered"
           size="sm"
           onClick={() => setShowReplyForm(prev => ({ ...prev, [question.id]: false }))}
          >
           {t('taskDetail.cancel')}
          </NextUIButton>
         </div>
        </div>
       ) : (
        <NextUIButton
         variant="bordered"
         size="sm"
         startContent={<MessageCircle size={16} />}
         onClick={() => setShowReplyForm(prev => ({ ...prev, [question.id]: true }))}
        >
         {t('taskDetail.reply')}
        </NextUIButton>
       )}
      </>
     )}
    </div>
   ))}
  </div>
 );
}
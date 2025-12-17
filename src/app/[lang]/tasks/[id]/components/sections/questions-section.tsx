'use client'

import { Avatar, Button as NextUIButton, Textarea, Chip, Skeleton, Card } from "@nextui-org/react";
import { MessageCircle, Star, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

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
 isLoading?: boolean;
}

export default function QuestionsSection({ questions, onReplyToQuestion, isLoading = false }: QuestionsSectionProps) {
 const t = useTranslations();
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

 // Loading skeleton
 if (isLoading) {
  return (
   <div className="space-y-4 mt-4">
    {[1, 2, 3].map((i) => (
     <Card key={i} className="p-4">
      <div className="flex items-center gap-3 mb-3">
       <Skeleton className="w-10 h-10 rounded-full" />
       <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
       </div>
      </div>
      <Skeleton className="h-16 w-full rounded" />
     </Card>
    ))}
   </div>
  );
 }

 // Empty state
 if (!questions || questions.length === 0) {
  return (
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="text-center py-12 px-4"
   >
    <div className="max-w-sm mx-auto">
     <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
      <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
     </div>
     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {t('taskDetail.questions.empty.title')}
     </h3>
     <p className="text-gray-600 dark:text-gray-400">
      {t('taskDetail.questions.empty.message')}
     </p>
    </div>
   </motion.div>
  );
 }

 return (
  <div className="space-y-4 mt-4">
   {questions.map((question, index) => (
    <motion.div
     key={question.id}
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.3, delay: index * 0.05 }}
    >
     <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      {/* User Header */}
      <div className="flex items-center justify-between mb-3">
       <div className="flex items-center gap-3">
        <Avatar
         src={question.user.avatar}
         name={question.user.name}
         className="w-10 h-10"
        />
        <div>
         <h4 className="font-medium text-gray-900 dark:text-white">{question.user.name}</h4>
         <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
           <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
           <span>{question.user.rating}</span>
          </div>
          <span>•</span>
          <span>{question.user.completedTasks} {t('taskDetail.completedTasks')}</span>
         </div>
        </div>
       </div>
       <div className="flex items-center gap-2">
        {question.reply ? (
         <Chip
          size="sm"
          variant="flat"
          color="success"
          startContent={<CheckCircle2 className="w-3 h-3" />}
         >
          {t('taskDetail.questions.answered')}
         </Chip>
        ) : (
         <Chip
          size="sm"
          variant="flat"
          color="warning"
          startContent={<Clock className="w-3 h-3" />}
         >
          {t('taskDetail.questions.unanswered')}
         </Chip>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">{question.timestamp}</span>
       </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
       <p className="text-gray-800 dark:text-gray-200">{question.question}</p>
      </div>

      {/* Reply */}
      {question.reply ? (
       <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-3 mb-3">
        <p className="text-blue-900 dark:text-blue-300 font-medium mb-1">
         {t('taskDetail.yourReply')}
        </p>
        <p className="text-blue-800 dark:text-blue-200">{question.reply}</p>
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
           variant="bordered"
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
    </motion.div>
   ))}
  </div>
 );
}
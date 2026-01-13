'use client'

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const TypingPlaceholder: React.FC = () => {
 const t = useTranslations();
 const [currentText, setCurrentText] = useState('');
 const [currentIndex, setCurrentIndex] = useState(0);
 const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
 const [isDeleting, setIsDeleting] = useState(false);
 
 // Different search examples to cycle through
 const searchExamples = [
  t('browseTasks.typing.plumber', { fallback: 'plumber in Sofia' }),
  t('browseTasks.typing.cleaner', { fallback: 'house cleaning' }),
  t('browseTasks.typing.electrician', { fallback: 'electrician repair' }),
  t('browseTasks.typing.tutor', { fallback: 'English tutor' }),
  t('browseTasks.typing.moving', { fallback: 'moving furniture' }),
  t('browseTasks.typing.gardener', { fallback: 'garden maintenance' })
 ];

 useEffect(() => {
  const currentPhrase = searchExamples[currentPhaseIndex];
  const typingDelay = isDeleting ? 50 : 100;
  const pauseDelay = isDeleting ? 1000 : 2000;

  const timer = setTimeout(() => {
   if (!isDeleting && currentIndex < currentPhrase.length) {
    // Typing forward
    setCurrentText(currentPhrase.slice(0, currentIndex + 1));
    setCurrentIndex(prev => prev + 1);
   } else if (isDeleting && currentIndex > 0) {
    // Deleting backward
    setCurrentText(currentPhrase.slice(0, currentIndex - 1));
    setCurrentIndex(prev => prev - 1);
   } else if (!isDeleting && currentIndex === currentPhrase.length) {
    // Finished typing, start deleting after pause
    setTimeout(() => setIsDeleting(true), pauseDelay);
   } else if (isDeleting && currentIndex === 0) {
    // Finished deleting, move to next phrase
    setIsDeleting(false);
    setCurrentPhaseIndex((prev) => (prev + 1) % searchExamples.length);
   }
  }, typingDelay);

  return () => clearTimeout(timer);
 }, [currentIndex, currentPhaseIndex, isDeleting, searchExamples]);

 return (
  <span className="text-gray-500">
   {currentText}
   <span className="animate-pulse">|</span>
  </span>
 );
};

export default TypingPlaceholder;
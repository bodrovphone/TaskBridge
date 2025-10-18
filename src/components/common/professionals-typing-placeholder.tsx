'use client'

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProfessionalsTypingPlaceholderProps {
 onComplete?: (text: string) => void;
}

const ProfessionalsTypingPlaceholder: React.FC<ProfessionalsTypingPlaceholderProps> = ({ onComplete }) => {
 const { t } = useTranslation();
 const [currentText, setCurrentText] = useState('');
 const [currentIndex, setCurrentIndex] = useState(0);
 const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
 const [isDeleting, setIsDeleting] = useState(false);
 
 // Professional search examples to cycle through
 const searchExamples = [
  t('professionals.typing.plumber', { fallback: 'plumber in Sofia' }),
  t('professionals.typing.cleaner', { fallback: 'house cleaning specialist' }),
  t('professionals.typing.electrician', { fallback: 'certified electrician' }),
  t('professionals.typing.tutor', { fallback: 'English tutor' }),
  t('professionals.typing.photographer', { fallback: 'wedding photographer' }),
  t('professionals.typing.handyman', { fallback: 'handyman services' })
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

export default ProfessionalsTypingPlaceholder;
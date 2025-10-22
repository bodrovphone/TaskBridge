'use client'

import { Card, CardBody, Image, Button, Chip } from "@heroui/react";
import { Camera, ArrowRight, Clock, Star, Trophy } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface PortfolioItem {
 id: string;
 title: string;
 beforeImage: string;
 afterImage: string;
 description?: string;
 duration?: string;
 difficulty?: 'Easy' | 'Medium' | 'Hard';
 clientFeedback?: string;
 rating?: number;
 tags?: string[];
}

interface PortfolioGalleryProps {
 portfolio: PortfolioItem[];
}

// Synchronized Before/After Galleries Component
function SynchronizedGalleries({ portfolio }: { portfolio: PortfolioItem[] }) {
 const { t } = useTranslation();
 const [currentIndex, setCurrentIndex] = useState(0);

 // Auto-slide every 4 seconds
 useEffect(() => {
  if (portfolio.length <= 1) return;

  const interval = setInterval(() => {
   setCurrentIndex((prev) => (prev + 1) % portfolio.length);
  }, 4000);

  return () => clearInterval(interval);
 }, [portfolio.length]);

 const nextSlide = () => {
  setCurrentIndex((prev) => (prev + 1) % portfolio.length);
 };

 const prevSlide = () => {
  setCurrentIndex((prev) => (prev - 1 + portfolio.length) % portfolio.length);
 };

 const goToSlide = (index: number) => {
  setCurrentIndex(index);
 };

 if (!portfolio || portfolio.length === 0) return null;

 return (
  <div className="space-y-6">
   {/* Gallery Headers */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="text-center">
     <h4 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
      {t('professionalDetail.portfolio.before')}
     </h4>
    </div>
    <div className="text-center md:block hidden">
     <h4 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
      {t('professionalDetail.portfolio.after')}
     </h4>
    </div>
   </div>

   {/* Synchronized Galleries */}
   <div className="relative">
    {/* Desktop: Side by side */}
    <div className="hidden md:flex justify-center items-start gap-8">
     {/* Before Gallery */}
     <div className="relative">
      <div className="relative w-80 h-60 rounded-xl overflow-hidden shadow-lg bg-gray-100">
       <Image
        src={portfolio[currentIndex].beforeImage}
        alt={`${portfolio[currentIndex].title} - Before`}
        className="w-full h-full object-cover transition-all duration-500"
        classNames={{
         img: "rounded-xl"
        }}
        loading="lazy"
       />
      </div>
     </div>

     {/* After Gallery */}
     <div className="relative">
      <div className="relative w-80 h-60 rounded-xl overflow-hidden shadow-lg bg-gray-100">
       <Image
        src={portfolio[currentIndex].afterImage}
        alt={`${portfolio[currentIndex].title} - After`}
        classNames={{
         img: "rounded-xl"
        }}
        className="w-full h-full object-cover transition-all duration-500"
        loading="lazy"
       />
      </div>
     </div>
    </div>

    {/* Mobile: Stacked */}
    <div className="md:hidden space-y-4">
     {/* Before Gallery */}
     <div className="relative">
      <div className="relative w-full h-60 rounded-xl overflow-hidden shadow-lg bg-gray-100">
       <Image
        src={portfolio[currentIndex].beforeImage}
        alt={`${portfolio[currentIndex].title} - Before`}
        className="w-full h-full object-cover transition-all duration-500"
        classNames={{
         img: "rounded-xl"
        }}
        loading="lazy"
       />
      </div>
     </div>

     {/* After Header & Gallery */}
     <div className="text-center mb-2">
      <h4 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
       {t('professionalDetail.portfolio.after')}
      </h4>
     </div>
     <div className="relative">
      <div className="relative w-full h-60 rounded-xl overflow-hidden shadow-lg bg-gray-100">
       <Image
        src={portfolio[currentIndex].afterImage}
        alt={`${portfolio[currentIndex].title} - After`}
        classNames={{
         img: "rounded-xl"
        }}
        className="w-full h-full object-cover transition-all duration-500"
        loading="lazy"
       />
      </div>
     </div>
    </div>

    {/* Vertical Separator Line - Desktop Only */}
    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2">
     <div className="w-px h-full bg-gradient-to-b from-purple-300 via-purple-400 to-purple-300"></div>
    </div>
   </div>


   {/* Current Project Description */}
   <div className="text-center space-y-4">
    <div className="text-xl font-bold text-gray-900 max-w-2xl mx-auto h-12 flex items-center">
     <h3 className="line-clamp-2 overflow-hidden text-center w-full">
      {portfolio[currentIndex].title}
     </h3>
    </div>

    {/* Description */}
    <div className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto h-10 flex items-center">
     <p className="line-clamp-2 overflow-hidden">
      {portfolio[currentIndex].description || "Professional demonstration of cleaning techniques and attention to detail for exceptional results."}
     </p>
    </div>
   </div>

   {/* Slide Indicators */}
   {portfolio.length > 1 && (
    <div className="flex justify-center space-x-2">
     {portfolio.map((_, index) => (
      <button
       key={index}
       onClick={() => goToSlide(index)}
       className={`w-3 h-3 rounded-full transition-colors ${
        index === currentIndex
         ? 'bg-purple-600'
         : 'bg-gray-300 hover:bg-gray-400'
       }`}
      />
     ))}
    </div>
   )}
  </div>
 );
}

export default function PortfolioGallery({ portfolio }: PortfolioGalleryProps) {
 const { t } = useTranslation();

 const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
   case 'Easy': return 'success';
   case 'Medium': return 'warning';
   case 'Hard': return 'danger';
   default: return 'default';
  }
 };

 const renderStars = (rating: number) => {
  return (
   <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
     <Star
      key={star}
      className={`w-4 h-4 ${
       star <= rating
        ? 'fill-yellow-400 text-yellow-400'
        : 'text-gray-300'
      }`}
     />
    ))}
   </div>
  );
 };

 if (!portfolio || portfolio.length === 0) {
  return (
   <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-purple-100">
    <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
     <Camera className="text-purple-600" size={28} />
     {t('professionalDetail.portfolio.title')}
    </h3>
    <div className="text-center py-12">
     <div className="bg-white/70 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
      <Camera className="text-purple-400" size={48} />
     </div>
     <p className="text-gray-600 text-lg">{t('professionalDetail.portfolio.noWork')}</p>
    </div>
   </div>
  );
 }

 return (
  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-purple-100">
   <div className="text-center mb-8">
    <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
     <Camera className="text-purple-600" size={28} />
     {t('professionalDetail.portfolio.title')}
    </h3>
    <p className="text-gray-600">{t('professionalDetail.portfolio.showcase')}</p>
   </div>

   {/* Synchronized Galleries */}
   <SynchronizedGalleries portfolio={portfolio} />

  </div>
 );
}
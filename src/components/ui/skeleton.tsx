'use client'

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
 return (
  <div
   className={cn("animate-pulse rounded-md bg-gray-200", className)}
   {...props}
  />
 )
}

// Skeleton components for specific content types
function TaskCardSkeleton() {
 return (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
   <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
   <div className="flex justify-between items-center mb-4">
    <Skeleton className="h-6 w-24" />
    <Skeleton className="h-4 w-16" />
   </div>
   <Skeleton className="h-6 w-3/4 mb-2" />
   <Skeleton className="h-4 w-full mb-1" />
   <Skeleton className="h-4 w-2/3 mb-4" />
   
   <div className="space-y-2 mb-4">
    <div className="flex items-center">
     <Skeleton className="h-4 w-4 mr-2" />
     <Skeleton className="h-4 w-32" />
    </div>
    <div className="flex items-center">
     <Skeleton className="h-4 w-4 mr-2" />
     <Skeleton className="h-4 w-24" />
    </div>
    <div className="flex items-center">
     <Skeleton className="h-4 w-4 mr-2" />
     <Skeleton className="h-4 w-20" />
    </div>
   </div>

   <div className="flex justify-between items-center pt-4 border-t border-gray-100">
    <div className="flex items-center space-x-2">
     <Skeleton className="w-6 h-6 rounded-full" />
     <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-8 w-24 rounded" />
   </div>
  </div>
 )
}

function CategoryCardSkeleton() {
 return (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
   <Skeleton className="w-12 h-12 rounded-lg mb-4" />
   <Skeleton className="h-6 w-3/4 mb-2" />
   <Skeleton className="h-4 w-full mb-1" />
   <Skeleton className="h-4 w-2/3 mb-4" />
   <Skeleton className="h-4 w-24" />
  </div>
 )
}

function TestimonialSkeleton() {
 return (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
   <div className="flex items-center mb-6">
    <Skeleton className="w-12 h-12 rounded-full mr-4" />
    <div className="flex-1">
     <Skeleton className="h-5 w-32 mb-2" />
     <Skeleton className="h-4 w-24" />
    </div>
   </div>
   <Skeleton className="h-4 w-full mb-2" />
   <Skeleton className="h-4 w-full mb-2" />
   <Skeleton className="h-4 w-3/4" />
  </div>
 )
}

Skeleton.displayName = 'Skeleton';
TaskCardSkeleton.displayName = 'TaskCardSkeleton';
CategoryCardSkeleton.displayName = 'CategoryCardSkeleton';
TestimonialSkeleton.displayName = 'TestimonialSkeleton';

export { Skeleton, TaskCardSkeleton, CategoryCardSkeleton, TestimonialSkeleton };
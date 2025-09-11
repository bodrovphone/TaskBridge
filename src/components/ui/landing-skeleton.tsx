'use client'

import { Skeleton, TaskCardSkeleton, CategoryCardSkeleton, TestimonialSkeleton } from "@/components/ui/skeleton"

function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-12 lg:h-16 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-14 w-40" />
                <Skeleton className="h-14 w-48" />
              </div>
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            {/* Right side image placeholder */}
            <div className="relative">
              <Skeleton className="w-full h-80 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
        </div>
      </section>

      {/* Featured Tasks Section Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Skeleton className="h-10 w-56 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features Section Skeleton */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-200 rounded-2xl animate-pulse" />
                <Skeleton className="h-6 w-32 mx-auto mb-4" />
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section Skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-12 w-80 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TestimonialSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <Skeleton className="h-8 w-40" />
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TestimonialSkeleton key={`pro-${i}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-2xl mb-6 animate-pulse" />
              <Skeleton className="h-12 w-96 mx-auto mb-6 bg-gray-700" />
              <Skeleton className="h-6 w-80 mx-auto mb-8 bg-gray-700" />
              
              {/* Stats Row Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <Skeleton className="h-8 w-16 mx-auto mb-2 bg-gray-600" />
                    <Skeleton className="h-4 w-20 mx-auto bg-gray-600" />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Skeleton className="h-12 w-40 bg-gray-700" />
                <Skeleton className="h-12 w-48 bg-gray-700" />
              </div>
              
              <Skeleton className="h-4 w-48 mx-auto mt-6 bg-gray-700" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

LandingSkeleton.displayName = 'LandingSkeleton';

export default LandingSkeleton;
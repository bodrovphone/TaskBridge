'use client'

import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react'
import { TrendingUp, Star, Calendar } from 'lucide-react'

interface StatisticsSectionProps {
  completedTasks: number
  averageRating: number
  totalEarnings: number
  profileViews: number
  memberSince: string
}

export function StatisticsSection({
  completedTasks,
  averageRating,
  totalEarnings,
  profileViews,
  memberSince
}: StatisticsSectionProps) {
  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-100">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Performance Statistics</h3>
        </div>
      </CardHeader>
      <CardBody className="px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="text-3xl font-bold text-primary mb-1">{completedTasks}</div>
            <div className="text-sm text-gray-600">Completed Tasks</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50">
            <div className="text-3xl font-bold text-yellow-600 mb-1 flex items-center justify-center gap-1">
              <Star className="w-6 h-6 fill-current" />
              {averageRating}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50">
            <div className="text-3xl font-bold text-green-600 mb-1">€{totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="text-3xl font-bold text-purple-600 mb-1">{profileViews}</div>
            <div className="text-sm text-gray-600">Profile Views</div>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Member since {new Date(memberSince).toLocaleDateString()}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

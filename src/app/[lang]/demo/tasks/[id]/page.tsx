import { getTaskById, getSimilarTasks } from "@/lib/mock-data";
import TaskDetailContent from "@/app/[lang]/tasks/[id]/components/task-detail-content";

interface DemoTaskDetailPageProps {
 params: Promise<{
  id: string;
  lang: string;
 }>;
}

/**
 * Demo Task Detail Page - Uses Mock Data
 *
 * This page preserves the original mock data implementation for:
 * - Comparing with real API data
 * - UI/UX testing without database
 * - Development and debugging
 *
 * Access: /[lang]/demo/tasks/[id]
 * Example: /en/demo/tasks/1
 */
export default async function DemoTaskDetailPage({ params }: DemoTaskDetailPageProps) {
 const { id, lang } = await params;

 // Get task data from mock data
 const task = getTaskById(id);
 const similarTasks = getSimilarTasks(id, 3);

 // Mock relatedData
 const mockRelatedData = {
  isOwner: false,
  applicationsCount: 12,
 };

 return (
  <div className="min-h-screen bg-gray-50">
   {/* Demo Banner */}
   <div className="bg-yellow-100 border-b-2 border-yellow-400 py-2 px-4 text-center">
    <span className="text-yellow-800 font-semibold">
     📋 DEMO MODE - Using Mock Data
    </span>
    <span className="text-yellow-700 ml-2 text-sm">
     (Compare with real data at <code className="bg-yellow-200 px-1 rounded">/tasks/{id}</code>)
    </span>
   </div>

   <TaskDetailContent
    task={task}
    similarTasks={similarTasks}
    isOwner={mockRelatedData.isOwner}
    applicationsCount={mockRelatedData.applicationsCount}
    lang={lang}
   />
  </div>
 );
}

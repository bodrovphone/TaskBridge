import { getTaskById, getSimilarTasks } from "@/lib/mock-data";
import TaskDetailContent from "./components/task-detail-content";

interface TaskDetailPageProps {
 params: Promise<{
  id: string;
  lang: string;
 }>;
}


export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
 const { id, lang } = await params;
 
 // Get task data from our mock data - uses static data regardless of ID
 const task = getTaskById(id);
 const similarTasks = getSimilarTasks(id, 3);

 return (
  <TaskDetailContent 
   task={task} 
   similarTasks={similarTasks} 
   lang={lang} 
  />
 );
}
import { Metadata } from 'next';
import { ProfessionalDetailPage } from '@/features/professionals';

interface DemoProfessionalPageProps {
 params: Promise<{
  id: string;
  lang: string;
 }>;
}

export async function generateMetadata({ params }: DemoProfessionalPageProps): Promise<Metadata> {
 const resolvedParams = await params;

 return {
  title: `Demo: Professional Profile - ${resolvedParams.id}`,
  description: `Demo professional profile page with mock data`,
 };
}

export default async function DemoProfessionalPage({ params }: DemoProfessionalPageProps) {
 const resolvedParams = await params;

 // Pass professional ID to demo component (uses mock data)
 return <ProfessionalDetailPage professionalId={resolvedParams.id} />;
}

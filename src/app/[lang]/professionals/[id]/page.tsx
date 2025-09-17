import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfessionalDetailPage } from '@/features/professionals';

interface ProfessionalPageProps {
  params: {
    id: string;
    lang: string;
  };
}

// Mock function to check if professional exists
async function getProfessional(id: string) {
  // In a real app, this would be an API call
  // For now, return a mock professional or null
  if (!id || id === 'undefined') {
    return null;
  }
  
  // Mock professional data - in real app would come from database
  return {
    id,
    // This would be populated with actual professional data
  };
}

export async function generateMetadata({ params }: ProfessionalPageProps): Promise<Metadata> {
  const professional = await getProfessional(params.id);
  
  if (!professional) {
    return {
      title: 'Professional Not Found',
    };
  }

  return {
    title: `Professional Profile - ${params.id}`,
    description: `View professional services and contact information`,
  };
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
  const professional = await getProfessional(params.id);

  if (!professional) {
    notFound();
  }

  return <ProfessionalDetailPage professionalId={params.id} />;
}
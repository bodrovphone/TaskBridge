import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfessionalDetailPageContent } from './components/professional-detail-page-content';

interface ProfessionalPageProps {
 params: Promise<{
  id: string;
  lang: string;
 }>;
}

// Fetch professional data from API
async function getProfessional(id: string) {
 try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/professionals/${id}`, {
   cache: 'no-store' // Always fetch fresh data
  });

  if (!response.ok) {
   return null;
  }

  const data = await response.json();
  return data.professional;
 } catch (error) {
  console.error('Error fetching professional:', error);
  return null;
 }
}

export async function generateMetadata({ params }: ProfessionalPageProps): Promise<Metadata> {
 const resolvedParams = await params;
 const professional = await getProfessional(resolvedParams.id);

 if (!professional) {
  return {
   title: 'Professional Not Found',
  };
 }

 return {
  title: `${professional.fullName || 'Professional'} - ${professional.specialization || 'Service Provider'}`,
  description: professional.bio || `View ${professional.fullName}'s professional services and reviews`,
 };
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
 const resolvedParams = await params;
 const professional = await getProfessional(resolvedParams.id);

 if (!professional) {
  notFound();
 }

 return <ProfessionalDetailPageContent professional={professional} lang={resolvedParams.lang} />;
}

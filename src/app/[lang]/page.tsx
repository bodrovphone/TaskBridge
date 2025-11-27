import { LandingPage } from '@/features/home'
import { getFeaturedTasks } from '@/lib/data/featured-tasks'
import { ProfessionalService } from '@/server/professionals/professional.service'

// Force static generation at build time (equivalent to getStaticProps)
export const dynamic = 'force-static'

// Revalidate every 2 hours (ISR - Incremental Static Regeneration)
// This means the page is rebuilt at most once every 2 hours when requested
export const revalidate = 7200 // 2 hours = 2 * 60 * 60 seconds

async function HomePage() {
 // Fetch featured tasks and professionals at build time (SSG with ISR)
 const professionalService = new ProfessionalService()

 const [featuredTasks, professionalsResult] = await Promise.all([
  getFeaturedTasks(),
  professionalService.getFeaturedProfessionals()
 ])

 // Extract professionals from service result, default to empty array on error
 const featuredProfessionals = professionalsResult.success ? professionalsResult.data : []

 return <LandingPage featuredTasks={featuredTasks} featuredProfessionals={featuredProfessionals} />
}

HomePage.displayName = 'HomePage';

export default HomePage;
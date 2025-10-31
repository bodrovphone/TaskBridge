import { LandingPage } from '@/features/home'
import { getFeaturedTasks } from '@/lib/data/featured-tasks'

// Force static generation at build time (equivalent to getStaticProps)
export const dynamic = 'force-static'

// Revalidate every 8 hours (ISR - Incremental Static Regeneration)
// This means the page is rebuilt at most once every 8 hours when requested
export const revalidate = 28800 // 8 hours = 8 * 60 * 60 seconds

async function HomePage() {
 // Fetch featured tasks at build time (SSG with ISR)
 const featuredTasks = await getFeaturedTasks()

 return <LandingPage featuredTasks={featuredTasks} />
}

HomePage.displayName = 'HomePage';

export default HomePage;
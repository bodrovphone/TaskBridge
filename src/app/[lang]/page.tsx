'use client'

import { LandingPage } from '@/features/home'

function HomePage() {
  // Authentication is currently disabled - show landing page for all users
  return <LandingPage />
}

HomePage.displayName = 'HomePage';

export default HomePage;
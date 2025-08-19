'use client'

import Landing from '@/components/pages/landing'

function HomePage() {
  // Authentication is currently disabled - show landing page for all users
  return <Landing />
}

HomePage.displayName = 'HomePage';

export default HomePage;
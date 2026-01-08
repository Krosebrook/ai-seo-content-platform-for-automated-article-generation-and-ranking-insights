import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { blink } from '@/lib/blink'
import { LandingPage } from '@/components/pages/LandingPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardPage } from '@/components/pages/DashboardPage'
import { GeneratePage } from '@/components/pages/GeneratePage'
import { ArticlesPage } from '@/components/pages/ArticlesPage'
import { KeywordsPage } from '@/components/pages/KeywordsPage'
import { RankingsPage } from '@/components/pages/RankingsPage'
import { SettingsPage } from '@/components/pages/SettingsPage'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Update navigation when clicking sidebar items
  useEffect(() => {
    const handleNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('button')
      if (button) {
        const navItems = ['dashboard', 'articles', 'generate', 'keywords', 'rankings', 'settings']
        const buttonText = button.textContent?.toLowerCase()
        const matchedPage = navItems.find(item => buttonText?.includes(item))
        if (matchedPage) {
          setCurrentPage(matchedPage)
        }
      }
    }

    document.addEventListener('click', handleNavigation)
    return () => document.removeEventListener('click', handleNavigation)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LandingPage />
        <Toaster position="top-right" />
      </>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'articles':
        return <ArticlesPage />
      case 'generate':
        return <GeneratePage />
      case 'keywords':
        return <KeywordsPage />
      case 'rankings':
        return <RankingsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <>
      <DashboardLayout currentPage={currentPage}>
        {renderPage()}
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  )
}

export default App 
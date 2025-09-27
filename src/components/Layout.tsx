'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Navigation from './Navigation'
import { UserWithRole } from '@/types/database'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check the current session immediately on mount
    checkAuth()

    // Subscribe to auth changes (login, logout, refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    // Cleanup: unsubscribe when Layout unmounts
    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select(`
          *,
          roles(name)
        `)
        .eq('id', authUser.id)
        .single()
    
      setUser(userData)
    
      // 🔹 Redirect if logged in but on "/" or "/auth"
      if (pathname === '/' || pathname === '/auth') {
        router.push('/incidentes')
      }
    } else {
      setUser(null)
    
      // 🔹 Redirect to auth if not logged in and not already there
      if (pathname !== '/auth' && pathname !== '/') {
        router.push('/auth')
      }
    }
    

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (user && pathname !== '/auth') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

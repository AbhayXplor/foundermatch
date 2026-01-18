'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, MessageSquare, Zap, Github, Puzzle } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true) // Start loading by default

  useEffect(() => {
    const handleSessionCheck = async () => {
      // Check if we just logged out
      const params = new URLSearchParams(window.location.search)
      if (params.get('logout') === 'true') {
        await supabase.auth.signOut()
        localStorage.clear()
        window.history.replaceState(null, '', '/') // Clean URL
        setLoading(false)
        return // Stop execution, don't check session or redirect
      }

      try {
        // Check session first BEFORE clearing hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session check error:', error)
          setLoading(false)
          return
        }

        if (session) {
          setUser(session.user)

          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single()

          // If profile exists (no error), go to swipe
          // If error is "PGRST116" (no rows), go to onboarding
          if (profile) {
            router.push('/swipe')
          } else {
            router.push('/onboarding')
          }
        } else {
          setLoading(false)
        }

        // Clean up URL hash AFTER we've checked everything
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      } catch (err) {
        console.error('Unexpected auth error:', err)
        setLoading(false)
      }
    }

    handleSessionCheck()
  }, [router])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'consent',
        },
      },
    })
    if (error) {
      console.error('Login error:', error)
      setLoading(false)
      alert('Failed to initiate login. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading FounderMatch...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
            <Puzzle className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">FounderMatch</span>
        </div>
        <div>
          {user ? (
            <Link
              href="/swipe"
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
            >
              Go to App
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-green-600 disabled:opacity-70"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-gray-900 sm:text-7xl">
            Find Your Co-Founder <br />
            <span className="text-green-500">In Minutes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Swipe on profiles like dating, but for startups. Our AI analyzes compatibility to prevent bad matches and help you build the next unicorn.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {user ? (
              <Link
                href="/swipe"
                className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-gray-800 hover:scale-105 shadow-xl"
              >
                Find Matches
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-gray-800 hover:scale-105 shadow-xl disabled:opacity-70"
              >
                <Github className="h-5 w-5" />
                {loading ? 'Connecting...' : 'Get Started with GitHub'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            title="AI-Powered Matching"
            description="Our Gemini AI analyzes skills, equity expectations, and commitment to find your perfect match."
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
            title="Structured Chat"
            description="Skip the awkward small talk. Use our icebreakers to dive deep into what matters."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
            title="Verified Profiles"
            description="All users are verified via GitHub to ensure they are real developers and founders."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} FounderMatch. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-3xl bg-gray-50 p-8 text-left transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { analyzeCompatibility } from '@/lib/gemini'
import ProfileCard from '@/components/ProfileCard'
import Header from '@/components/Header'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import Link from 'next/link'

export default function SwipePage() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [matchModal, setMatchModal] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }

            // Get current user profile
            const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            setCurrentUser(userProfile)

            // Get profiles I haven't swiped on yet
            const { data: swipes } = await supabase
                .from('swipes')
                .select('target_id')
                .eq('swiper_id', user.id)

            const swipedIds = swipes?.map(s => s.target_id) || []
            swipedIds.push(user.id) // Don't show myself

            const { data: potentialMatches } = await supabase
                .from('users')
                .select('*')
                .not('id', 'in', `(${swipedIds.join(',')})`)
                .limit(10)

            if (potentialMatches) {
                setProfiles(potentialMatches)
            }
        }
        loadData()
    }, [router])

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (!profiles.length || !currentUser) return

        const targetProfile = profiles[0]
        const action = direction === 'right' ? 'like' : 'pass'

        // Optimistic UI update
        setProfiles(prev => prev.slice(1))

        // Record swipe
        await supabase.from('swipes').insert({
            swiper_id: currentUser.id,
            target_id: targetProfile.id,
            action
        })

        if (action === 'like') {
            // Check for match
            // Auto-match for mock profiles
            const mockIds = [
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333'
            ]

            if (mockIds.includes(targetProfile.id)) {
                // Call API to simulate mock response & AI icebreaker
                const res = await fetch('/api/mocks/respond', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        mockId: targetProfile.id
                    })
                })

                if (res.ok) {
                    const data = await res.json()
                    // Manually trigger match modal with API data
                    setMatchModal({
                        profile: targetProfile,
                        score: data.analysis.score,
                        summary: data.analysis.summary,
                        matchId: data.match.id
                    })

                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#10B981', '#3B82F6', '#F59E0B']
                    })
                }
                return
            }

            const { data: mutualLike } = await supabase
                .from('swipes')
                .select('*')
                .eq('swiper_id', targetProfile.id)
                .eq('target_id', currentUser.id)
                .eq('action', 'like')
                .single()

            if (mutualLike) {
                handleMatch(targetProfile)
            }
        }
    }

    const handleMatch = async (matchedProfile: any) => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6', '#F59E0B']
        })

        // Trigger AI Analysis
        const analysis = await analyzeCompatibility(currentUser, matchedProfile)

        // Create match record
        const { data: match } = await supabase
            .from('matches')
            .insert({
                user1_id: currentUser.id,
                user2_id: matchedProfile.id,
                compatibility_score: analysis.score,
                analysis_summary: JSON.stringify(analysis.summary)
            })
            .select()
            .single()

        setMatchModal({
            profile: matchedProfile,
            score: analysis.score,
            summary: analysis.summary,
            matchId: match.id
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={currentUser} />

            <main className="flex flex-col items-center justify-center pt-12 pb-24 px-4 overflow-hidden">
                {/* Card Stack */}
                <div className="relative flex h-[650px] w-full max-w-[400px] items-center justify-center">
                    <AnimatePresence>
                        {profiles.map((profile, index) => (
                            index === 0 && (
                                <ProfileCard
                                    key={profile.id}
                                    profile={profile}
                                    onSwipe={handleSwipe}
                                />
                            )
                        ))}
                    </AnimatePresence>

                    {profiles.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">No more profiles</h3>
                            <p className="text-sm mt-2">Check back later for more potential co-founders!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Match Modal */}
            <AnimatePresence>
                {matchModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-md overflow-hidden rounded-[32px] bg-white text-center shadow-2xl"
                        >
                            <div className="bg-gradient-to-r from-green-400 to-emerald-600 p-8 text-white">
                                <h2 className="text-4xl font-black italic tracking-tight">IT'S A MATCH!</h2>
                                <p className="mt-2 font-medium opacity-90">You and {matchModal.profile.name} liked each other.</p>
                            </div>

                            <div className="p-8">
                                <div className="mb-8 flex justify-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={currentUser.avatar_url}
                                            className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                                        />
                                    </div>
                                    <div className="relative">
                                        <img
                                            src={matchModal.profile.avatar_url}
                                            className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                                        />
                                        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-md border-2 border-white">
                                            <span className="text-xs font-bold">{matchModal.score}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 rounded-2xl bg-gray-50 p-5 text-left border border-gray-100">
                                    <h3 className="mb-3 font-bold text-gray-800 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        AI Compatibility Analysis
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        {matchModal.summary.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-400" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href={`/chat/${matchModal.matchId}`}
                                        className="block w-full rounded-xl bg-green-500 py-4 font-bold text-white transition-colors hover:bg-green-600 shadow-lg shadow-green-500/30"
                                    >
                                        Send a Message
                                    </Link>
                                    <button
                                        onClick={() => setMatchModal(null)}
                                        className="block w-full rounded-xl bg-gray-100 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        Keep Swiping
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

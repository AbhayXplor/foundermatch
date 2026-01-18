'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Loader2 } from 'lucide-react'
import Header from '@/components/Header'

export default function MatchesPage() {
    const [matches, setMatches] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadMatches = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch full user profile for Header
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            setCurrentUser(profile)

            const { data } = await supabase
                .from('matches')
                .select(`
          id,
          compatibility_score,
          user1:users!matches_user1_id_fkey(*),
          user2:users!matches_user2_id_fkey(*)
        `)
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .order('created_at', { ascending: false })

            if (data) {
                const formattedMatches = (data as any[]).map(match => {
                    const otherUser = match.user1.id === user.id ? match.user2 : match.user1
                    return {
                        ...match,
                        otherUser
                    }
                })
                setMatches(formattedMatches)
            }
            setLoading(false)
        }
        loadMatches()
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={currentUser} />

            <main className="mx-auto max-w-4xl px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Matches</h1>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match, index) => (
                        <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/chat/${match.id}`}>
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md border border-gray-100 hover:border-green-200">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={match.otherUser.avatar_url}
                                            alt={match.otherUser.name}
                                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{match.otherUser.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{match.otherUser.role}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    {match.compatibility_score}% Match
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                                        <MessageCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {matches.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            <p>No matches yet. Keep swiping to find your co-founder!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, MoreVertical } from 'lucide-react'
import Link from 'next/link'

export default function ChatPage() {
    const { matchId } = useParams()
    const router = useRouter()
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [matchData, setMatchData] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }
            setCurrentUser(user)

            // Load match details
            const { data: match } = await supabase
                .from('matches')
                .select(`
          *,
          user1:users!matches_user1_id_fkey(*),
          user2:users!matches_user2_id_fkey(*)
        `)
                .eq('id', matchId)
                .single()

            if (match) {
                const matchData = match as any
                const otherUser = matchData.user1.id === user.id ? matchData.user2 : matchData.user1
                setMatchData({ ...matchData, otherUser })
            }

            // Load messages
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true })

            if (msgs) setMessages(msgs)

            // Subscribe to new messages
            const channel = supabase
                .channel(`chat:${matchId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `match_id=eq.${matchId}`
                    },
                    (payload) => {
                        setMessages(prev => [...prev, payload.new])
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
        loadData()
    }, [matchId, router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        const { error } = await supabase
            .from('messages')
            .insert({
                match_id: matchId,
                sender_id: currentUser.id,
                content: newMessage.trim()
            })

        if (!error) {
            setNewMessage('')
        }
    }

    if (!matchData) return <div className="min-h-screen bg-gray-50" />

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/matches" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={matchData.otherUser.avatar_url}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">{matchData.otherUser.name}</h2>
                            <p className="text-xs text-green-600 font-medium">{matchData.compatibility_score}% Match</p>
                        </div>
                    </div>
                </div>
                <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {/* AI Insight Header */}
                {matchData.analysis_summary && (
                    <div className="mx-auto mb-6 max-w-2xl rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-100 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-green-700">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                                {matchData.compatibility_score}%
                            </span>
                            <h3 className="font-bold">AI Compatibility Insight</h3>
                        </div>
                        <ul className="space-y-1 pl-8 text-sm text-gray-600 list-disc">
                            {(() => {
                                try {
                                    const summary = typeof matchData.analysis_summary === 'string'
                                        ? JSON.parse(matchData.analysis_summary)
                                        : matchData.analysis_summary
                                    return Array.isArray(summary) ? summary.map((point: string, i: number) => (
                                        <li key={i}>{point}</li>
                                    )) : <li>High compatibility match!</li>
                                } catch (e) {
                                    return <li>Great potential for collaboration.</li>
                                }
                            })()}
                        </ul>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-green-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <p className={`mt-1 text-[10px] ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="rounded-full bg-green-500 p-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50 shadow-md shadow-green-500/20"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

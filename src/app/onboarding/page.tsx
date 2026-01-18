'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [formData, setFormData] = useState({
        role: '',
        skills: '',
        commitment: 'Full-time',
        equity: '50/50',
        linkedin_url: '',
        bio: '',
    })

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }

            // Check if profile already exists
            const { data: profile } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single()

            if (profile) {
                router.push('/swipe')
            } else {
                setChecking(false)
            }
        }
        checkUser()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const skillsArray = formData.skills.split(',').map(s => s.trim())

        const payload = {
            id: user.id,
            name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
            role: formData.role,
            skills: skillsArray,
            commitment: formData.commitment,
            equity: formData.equity,
            bio: formData.bio,
            // linkedin_url: formData.linkedin_url // Removing potentially missing column
        }
        console.log('Upserting payload:', payload)

        const { error } = await supabase
            .from('users')
            .upsert(payload)

        if (error) {
            console.error('Error updating profile:', error)
            alert('Error saving profile. Please try again.')
        } else {
            router.push('/swipe')
        }
        setLoading(false)
    }

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 text-gray-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-xl space-y-8 py-12"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="mt-2 text-gray-500">Tell us about yourself to find the perfect match.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-xl">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Role</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="">Select a role</option>
                            <option value="Technical Founder">Technical Founder</option>
                            <option value="Non-Technical Founder">Non-Technical Founder</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Designer">Designer</option>
                            <option value="Marketer">Marketer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Skills (comma separated)</label>
                        <input
                            type="text"
                            required
                            placeholder="React, Node.js, Marketing, Sales"
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Commitment Level</label>
                        <select
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                            value={formData.commitment}
                            onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Weekends">Weekends</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Equity Expectations</label>
                        <select
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                            value={formData.equity}
                            onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
                        >
                            <option value="50/50">50/50 Split</option>
                            <option value="Negotiable">Negotiable</option>
                            <option value="Paid + Equity">Paid + Equity</option>
                            <option value="No Equity">No Equity</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">LinkedIn URL (Optional)</label>
                        <input
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Bio (Max 200 chars)</label>
                        <textarea
                            required
                            maxLength={200}
                            rows={3}
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-green-500 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-600 hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                'Start Matching'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/swipe')}
                            className="flex-1 rounded-xl border-2 border-gray-200 bg-white py-4 font-bold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
                        >
                            Skip for now
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

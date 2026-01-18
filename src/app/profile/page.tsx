'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { motion } from 'framer-motion'
import { Save, Trash2, Loader2 } from 'lucide-react'

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        role: '',
        skills: '',
        commitment: '',
        equity: '',
        bio: '',
    })

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setUser(profile)
                setFormData({
                    role: profile.role || '',
                    skills: profile.skills?.join(', ') || '',
                    commitment: profile.commitment || 'Full-time',
                    equity: profile.equity || '50/50',
                    bio: profile.bio || '',
                })
            }
            setLoading(false)
        }
        loadProfile()
    }, [router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean)

        const { error } = await supabase
            .from('users')
            .update({
                role: formData.role,
                skills: skillsArray,
                commitment: formData.commitment,
                equity: formData.equity,
                bio: formData.bio,
            })
            .eq('id', user.id)

        if (error) {
            alert('Error updating profile')
        } else {
            alert('Profile updated successfully!')
        }
        setSaving(false)
    }

    const handleDeleteAccount = async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            setSaving(true)
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const response = await fetch('/api/auth/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to delete account')
                }

                await supabase.auth.signOut()
                localStorage.clear()
                window.location.replace('/?logout=true')
            } catch (error) {
                console.error('Error deleting account:', error)
                alert('Failed to delete account. Please try again.')
                setSaving(false)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />

            <main className="mx-auto max-w-2xl px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[32px] bg-white p-8 shadow-xl"
                >
                    <div className="mb-8 flex items-center gap-6">
                        <img
                            src={user?.avatar_url}
                            alt={user?.name}
                            className="h-24 w-24 rounded-full border-4 border-gray-100 object-cover"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                            <p className="text-gray-500">Manage your founder profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">Role</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Technical Founder">Technical Founder</option>
                                    <option value="Non-Technical Founder">Non-Technical Founder</option>
                                    <option value="Product Manager">Product Manager</option>
                                    <option value="Designer">Designer</option>
                                    <option value="Marketer">Marketer</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">Commitment</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                                    value={formData.commitment}
                                    onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Weekends">Weekends</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">Equity Expectations</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
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
                                <label className="mb-2 block text-sm font-bold text-gray-700">Skills</label>
                                <input
                                    type="text"
                                    placeholder="React, Node.js, Marketing..."
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Bio</label>
                            <textarea
                                rows={4}
                                maxLength={200}
                                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                            <p className="mt-1 text-right text-xs text-gray-400">
                                {formData.bio.length}/200
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-xl bg-green-500 px-8 py-3 font-bold text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all hover:scale-105 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    )
}

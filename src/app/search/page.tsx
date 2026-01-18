'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { Search, MapPin, Briefcase, Code2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
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

            // Get all profiles except me
            const { data: allProfiles } = await supabase
                .from('users')
                .select('*')
                .neq('id', user.id)
                .limit(50)

            if (allProfiles) {
                setProfiles(allProfiles)
                setFilteredProfiles(allProfiles)
            }
            setLoading(false)
        }
        loadData()
    }, [router])

    useEffect(() => {
        const term = searchTerm.toLowerCase()
        const filtered = profiles.filter(p =>
            p.name?.toLowerCase().includes(term) ||
            p.role?.toLowerCase().includes(term) ||
            p.skills?.some((s: string) => s.toLowerCase().includes(term))
        )
        setFilteredProfiles(filtered)
    }, [searchTerm, profiles])

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={currentUser} />

            <main className="mx-auto max-w-7xl px-4 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="mb-4 text-3xl font-bold text-gray-900">Discover Founders</h1>
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, role, or skills..."
                            className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProfiles.map((profile) => (
                            <div key={profile.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md border border-gray-100">
                                <div className="aspect-video w-full bg-gray-100 relative">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-600">
                                            <User className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                        <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                                        <p className="text-sm text-gray-200">{profile.role}</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {profile.skills?.slice(0, 3).map((skill: string, i: number) => (
                                            <span key={i} className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-100">
                                                {skill}
                                            </span>
                                        ))}
                                        {profile.skills?.length > 3 && (
                                            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                                                +{profile.skills.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {profile.commitment}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Code2 className="h-3 w-3" />
                                            {profile.equity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredProfiles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No founders found matching your search.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

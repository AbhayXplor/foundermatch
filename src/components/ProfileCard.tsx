'use client'

import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { X, Heart, Clock, DollarSign, Briefcase, Code, Linkedin } from 'lucide-react'
import { useState } from 'react'

interface Profile {
    id: string
    name: string
    avatar_url: string
    role: string
    skills: string[]
    commitment: string
    equity: string
    bio: string
    linkedin_url?: string
}

interface ProfileCardProps {
    profile: Profile
    onSwipe: (direction: 'left' | 'right') => void
}

export default function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
    const [showBio, setShowBio] = useState(false)
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-15, 15])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe('right')
        } else if (info.offset.x < -100) {
            onSwipe('left')
        }
    }

    return (
        <>
            <motion.div
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute h-[650px] w-full max-w-[400px] cursor-grab active:cursor-grabbing"
            >
                <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-black/5">
                    {/* Image Section */}
                    <div className="relative h-[55%] w-full">
                        <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                            <div className="mb-1 inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400 backdrop-blur-md border border-green-500/30">
                                OPEN TO WORK
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
                            <p className="text-lg font-medium text-gray-200 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {profile.role}
                            </p>
                        </div>

                        {/* Match Score Badge (Mock) */}
                        <div className="absolute top-6 right-6 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-lg border-4 border-green-500">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Match</span>
                            <span className="text-xl font-black text-green-600">85%</span>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex h-[45%] flex-col p-6">
                        {/* Core Stack */}
                        <div className="mb-6">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Core Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.slice(0, 4).map((skill) => (
                                    <span
                                        key={skill}
                                        className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-700 border border-gray-200"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-3 border border-green-100">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Commitment</p>
                                    <p className="text-xs font-bold text-gray-800">{profile.commitment}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl bg-purple-50 p-3 border border-purple-100">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Equity</p>
                                    <p className="text-xs font-bold text-gray-800">{profile.equity}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skill Alignment Bar */}
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-gray-500">Skill Alignment</span>
                                <span className="text-green-600">HIGH</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Floating below) */}
                <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-8">
                    <button
                        onClick={() => onSwipe('left')}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-red-500 shadow-xl transition-transform hover:scale-110 hover:bg-red-50"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <button
                        onClick={() => setShowBio(true)}
                        className="flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-gray-700 shadow-xl transition-transform hover:scale-105"
                    >
                        View Full Bio
                    </button>
                    <button
                        onClick={() => onSwipe('right')}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 transition-transform hover:scale-110 hover:bg-green-600"
                    >
                        <Heart className="h-8 w-8 fill-current" />
                    </button>
                </div>
            </motion.div>

            {/* Bio Modal */}
            <AnimatePresence>
                {showBio && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowBio(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-48">
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.name}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <button
                                    onClick={() => setShowBio(false)}
                                    className="absolute right-4 top-4 rounded-full bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/40"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="absolute bottom-4 left-6 text-white">
                                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                                    <p className="text-gray-200">{profile.role}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-bold uppercase text-gray-400">About</h3>
                                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-bold uppercase text-gray-400">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {profile.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077b5] py-3 font-bold text-white transition-transform hover:scale-[1.02]"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                        View LinkedIn Profile
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

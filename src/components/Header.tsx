'use client'

import Link from 'next/link'
import { MessageCircle, User, Settings, LogOut, Search, Puzzle } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({ user }: { user: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.clear()
        window.location.replace('/?logout=true') // Use replace to prevent back button
    }

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
                    <Puzzle className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-gray-900">FounderMatch</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link href="/swipe" className="hover:text-gray-900 transition-colors">Discover</Link>
                <Link href="/search" className="hover:text-gray-900 transition-colors">Search</Link>
                <Link href="/matches" className="hover:text-gray-900 transition-colors">Messages</Link>
                <Link href="/profile" className="hover:text-gray-900 transition-colors">My Profile</Link>
            </nav>

            {/* Search & Profile */}
            <div className="flex items-center gap-4">
                <Link href="/search" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 md:hidden">
                    <Search className="h-5 w-5" />
                </Link>


                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md transition-transform hover:scale-105"
                    >
                        <img
                            src={user?.avatar_url || 'https://github.com/shadcn.png'}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5"
                            >
                                <Link href="/profile" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}

'use client'

import { useState } from 'react'

export default function AdminPage() {
    const [status, setStatus] = useState('')

    const handleWipe = async () => {
        setStatus('Wiping data...')
        const res = await fetch('/api/admin/wipe', { method: 'POST' })
        if (res.ok) setStatus('Data wiped successfully!')
        else setStatus('Failed to wipe data.')
    }

    const handleSeed = async () => {
        setStatus('Seeding mock profiles...')
        const res = await fetch('/api/admin/seed', { method: 'POST' })
        if (res.ok) setStatus('Mock profiles seeded!')
        else setStatus('Failed to seed data.')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-100">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <div className="flex gap-4">
                <button
                    onClick={handleWipe}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                    ⚠️ WIPE ALL DATA
                </button>
                <button
                    onClick={handleSeed}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
                >
                    🌱 SEED MOCK PROFILES
                </button>
            </div>
            {status && <p className="text-lg font-medium">{status}</p>}
        </div>
    )
}

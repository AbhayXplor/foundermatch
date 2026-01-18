import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const mocks = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                name: 'Sarah Chen',
                role: 'Technical Co-Founder',
                skills: ['React', 'Node.js', 'AI/ML', 'Python'],
                commitment: 'Full-time',
                equity: 'Equal Split',
                bio: 'Ex-Google engineer looking to build the next big AI startup. I handle the tech, you handle the business.',
                avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                name: 'David Miller',
                role: 'Growth & Marketing',
                skills: ['SEO', 'Content Marketing', 'Product Strategy'],
                commitment: 'Part-time',
                equity: 'Negotiable',
                bio: 'Serial entrepreneur with 2 exits. Looking for a technical partner to build an MVP.',
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                name: 'Elena Rodriguez',
                role: 'Product Designer',
                skills: ['Figma', 'UI/UX', 'Branding', 'Frontend'],
                commitment: 'Full-time',
                equity: 'Salary + Equity',
                bio: 'Award-winning designer obsessed with user experience. Let\'s make something beautiful.',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'
            }
        ]

        const { error } = await supabase.from('users').upsert(mocks)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
    }
}

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateIcebreaker, analyzeCompatibility } from '@/lib/gemini'

export async function POST(request: Request) {
    try {
        const { userId, mockId } = await request.json()

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Get both profiles for AI
        const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
        const { data: mock } = await supabase.from('users').select('*').eq('id', mockId).single()

        if (!user || !mock) throw new Error('Profiles not found')

        // 2. Simulate Mock Swiping Right
        await supabase.from('swipes').upsert({
            swiper_id: mockId,
            target_id: userId,
            action: 'like'
        })

        // 3. Create Match
        const aiAnalysis = await analyzeCompatibility(user, mock)

        const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
                user1_id: userId,
                user2_id: mockId,
                compatibility_score: aiAnalysis.score,
                analysis_summary: JSON.stringify(aiAnalysis.summary)
            })
            .select()
            .single()

        if (matchError) {
            // Match might already exist, try to fetch it
            const { data: existingMatch } = await supabase
                .from('matches')
                .select('*')
                .or(`and(user1_id.eq.${userId},user2_id.eq.${mockId}),and(user1_id.eq.${mockId},user2_id.eq.${userId})`)
                .single()

            if (existingMatch) {
                return NextResponse.json({ match: existingMatch, analysis: aiAnalysis })
            }
        }

        // 4. Generate & Send Icebreaker
        const icebreaker = await generateIcebreaker(user, mock)

        await supabase.from('messages').insert({
            match_id: match?.id,
            sender_id: mockId,
            content: icebreaker
        })

        return NextResponse.json({ match, analysis: aiAnalysis, icebreaker })

    } catch (error) {
        console.error('Mock response error:', error)
        return NextResponse.json({ error: 'Failed to process mock response' }, { status: 500 })
    }
}

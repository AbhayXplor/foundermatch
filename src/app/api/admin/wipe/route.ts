import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const mockIds = [
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
            '33333333-3333-3333-3333-333333333333'
        ]
        const mockFilter = `(${mockIds.join(',')})`

        // Delete all data EXCEPT mock profiles
        await supabase.from('messages').delete().not('sender_id', 'in', mockFilter)
        await supabase.from('matches').delete().not('user1_id', 'in', mockFilter).not('user2_id', 'in', mockFilter)
        await supabase.from('swipes').delete().not('swiper_id', 'in', mockFilter)
        await supabase.from('users').delete().not('id', 'in', mockFilter)

        // Note: We can't easily delete from auth.users via client SDK without admin API, 
        // but clearing public tables removes the "ghost" profiles the user sees.

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to wipe data' }, { status: 500 })
    }
}

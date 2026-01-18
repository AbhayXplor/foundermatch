import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    try {
        // Verify session
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete user data
        // 1. Delete messages
        await supabase.from('messages').delete().or(`sender_id.eq.${user.id}`)

        // 2. Delete matches
        await supabase.from('matches').delete().or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

        // 3. Delete swipes
        await supabase.from('swipes').delete().eq('swiper_id', user.id)

        // 4. Delete profile
        await supabase.from('users').delete().eq('id', user.id)

        // 5. Delete auth user
        await supabase.auth.admin.deleteUser(user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if new user — if they have no taste_dna row, send to onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: dna } = await supabase
          .from('taste_dna')
          .select('user_id')
          .eq('user_id', user.id)
          .single()
        
        if (!dna) {
          // Brand new user — needs onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}

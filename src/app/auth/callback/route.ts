import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('OAuth callback triggered', { 
    hasCode: !!code, 
    origin,
    url: requestUrl.toString() 
  });

  if (code) {
    // Create response first
    const response = NextResponse.redirect(`${origin}/`);
    
    console.log('Creating Supabase server client...');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log('Setting cookies:', cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    console.log('Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        error
      });
      return NextResponse.redirect(`${origin}/login?error=auth_failed&msg=${encodeURIComponent(error.message)}`);
    }

    console.log('Session exchange successful:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      userId: data.user?.id
    });

    return response;
  }

  console.log('No code provided, redirecting to login');
  return NextResponse.redirect(`${origin}/login`);
}

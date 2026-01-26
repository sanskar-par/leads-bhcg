import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    
    // Create a Supabase client with cookie handlers
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
        },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({
                name,
                value,
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              });
            } catch (error) {
              // Handle cookie setting errors
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
              });
            } catch (error) {
              // Handle cookie removal errors
            }
          },
        },
      }
    );

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      if (data.session) {
        // Create response with redirect
        const response = NextResponse.redirect(`${origin}/`);
        
        // Set auth cookies manually to ensure they persist
        response.cookies.set('bhcg-leads-auth-token', data.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
        
        return response;
      }
      
      return NextResponse.redirect(`${origin}/`);
    } catch (error) {
      console.error('Callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/login`);
}

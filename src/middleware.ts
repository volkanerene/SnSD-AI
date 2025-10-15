import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🔍 [MIDDLEWARE] Request:', request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log(
            '🍪 [MIDDLEWARE] Getting cookies:',
            cookies.length,
            'cookies'
          );
          console.log(
            '🍪 [MIDDLEWARE] Cookie names:',
            cookies.map((c) => c.name).join(', ')
          );
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log(
            '🍪 [MIDDLEWARE] Setting cookies:',
            cookiesToSet.length,
            'cookies'
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // IMPORTANT: Refresh session to ensure cookies are set properly
  const {
    data: { user }
  } = await supabase.auth.getUser();

  console.log(
    '👤 [MIDDLEWARE] User:',
    user ? `${user.email} (${user.id})` : 'Not authenticated'
  );

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  console.log('🔒 [MIDDLEWARE] Is protected route?', isProtectedRoute);

  // If user is not logged in and trying to access protected route, redirect to sign-in
  if (isProtectedRoute && !user) {
    console.log('❌ [MIDDLEWARE] No user, redirecting to sign-in');
    const redirectUrl = new URL('/auth/sign-in', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  const authRoutes = ['/auth/sign-in', '/auth/sign-up'];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    console.log(
      '✅ [MIDDLEWARE] User authenticated on auth page, redirecting to dashboard'
    );
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('✅ [MIDDLEWARE] Allowing request to proceed');
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};

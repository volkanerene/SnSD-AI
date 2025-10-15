import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Get user and profile
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If user is not logged in and trying to access protected route, redirect to sign-in
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/sign-in', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin-only routes
  const adminRoutes = ['/dashboard/admin'];
  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAdminRoute && user) {
    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    // Only SNSD Admin (role_id = 1) and Company Admin (role_id = 1) can access
    if (!profile || profile.role_id > 1) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  const authRoutes = ['/auth/sign-in', '/auth/sign-up'];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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

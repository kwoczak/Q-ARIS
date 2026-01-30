
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth-lib';

// 1. Specify protected and public routes
const protectedRoutes = ['/admin', '/museum', '/curator', '/dashboard'];
const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get('session')?.value;
    const session = cookie ? await decrypt(cookie) : null;

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 5. Redirect to /dashboard (or role specific) if the user is authenticated
    if (
        isPublicRoute &&
        session?.userId &&
        !req.nextUrl.pathname.startsWith('/dashboard')
    ) {
        // Determine redirect based on role
        if (session.role === 'admin') return NextResponse.redirect(new URL('/admin', req.nextUrl));
        if (session.role === 'museum') return NextResponse.redirect(new URL('/museum', req.nextUrl));
        if (session.role === 'curator') return NextResponse.redirect(new URL('/curator', req.nextUrl));

        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    // 6. Role based access control (Simple check)
    if (path.startsWith('/admin') && session?.role !== 'admin') {
        // Allow if admin is accessing generic routes? strictly enforce /admin only for admin
        return NextResponse.redirect(new URL('/unauthorized', req.nextUrl)); // Create unauthorized page or just redirect back
    }
    // Similar checks for museum/curator can be added here if they have strict silos

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

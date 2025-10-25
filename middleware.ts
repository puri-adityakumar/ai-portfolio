import { NextRequest, NextResponse } from 'next/server';

/**
 * Global middleware for request handling and error logging
 */
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Log incoming requests (in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`${request.method} ${request.url} - ${new Date().toISOString()}`);
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Add request timing header (in development)
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${duration}ms`);
  }

  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
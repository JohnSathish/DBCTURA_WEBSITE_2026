import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    // Don't redirect if already on login page
    if (pathname === "/admin/login") {
      return NextResponse.next()
    }
    
    // Redirect to login if accessing admin routes without token
    if (pathname.startsWith("/admin") && !token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isAdminRoute = pathname.startsWith("/admin")
        
        // Allow access to login page without token
        if (pathname === "/admin/login") {
          return true
        }
        
        // Require token for all other admin routes
        if (isAdminRoute) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"],
}


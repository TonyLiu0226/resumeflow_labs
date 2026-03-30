import NextAuth from "next-auth";
import { authConfig } from "@/app/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - /auth/* (sign-in / sign-up pages)
     * - /api/auth/* (NextAuth API routes including register)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /public assets
     */
    "/((?!auth|api/auth|_next/static|_next/image|favicon\\.ico|.*\\.svg$|.*\\.png$).*)",
  ],
};

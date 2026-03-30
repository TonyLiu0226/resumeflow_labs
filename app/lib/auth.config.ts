import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config (no Node.js-only imports like Prisma).
 * Used by the middleware to check sessions without pulling in node:url etc.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async authorized({ auth }) {
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [],
} satisfies NextAuthConfig;

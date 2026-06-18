import type { NextAuthConfig } from 'next-auth';

// Edge-safe config: no bcrypt, no DB imports — safe to use in middleware
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isPublic = isAuthPage || pathname === '/';

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      if (!isPublic && !isLoggedIn) {
        return false; // triggers redirect to pages.signIn
      }
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers: [],
};

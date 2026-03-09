import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// Edge-compatible config — no Prisma adapter, used by middleware
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: "read:user read:org user:email" },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/guild", "/prestige"];
      const isProtected = protectedPaths.some((p) => nextUrl.pathname.startsWith(p));

      if (isProtected && !isLoggedIn) return false;
      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
};

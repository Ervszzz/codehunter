import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      // On first sign-in, account and profile are available — update DB with GitHub data
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          avatar_url: string;
        };
        if (token.sub) {
          await prisma.user.update({
            where: { id: token.sub },
            data: {
              githubId: String(githubProfile.id),
              username: githubProfile.login,
              avatarUrl: githubProfile.avatar_url,
            },
          }).catch(() => {});
        }
        token.username = githubProfile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

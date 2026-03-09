import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user read:org user:email",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        // Store GitHub-specific data on first sign-in
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          avatar_url: string;
        };
        await prisma.user.update({
          where: { id: user.id as string },
          data: {
            githubId: String(githubProfile.id),
            username: githubProfile.login,
            avatarUrl: githubProfile.avatar_url,
          },
        }).catch(() => {
          // User might not exist yet on first creation — handled by adapter
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

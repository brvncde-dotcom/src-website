import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // Trial users have no password — they're auto-authenticated via register
        if (!user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Attach trial/membership info from DB
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { trialEnd: true, isMember: true, id: true },
        });
        if (dbUser) {
          token.trialEnd = dbUser.trialEnd?.toISOString();
          token.isMember = dbUser.isMember;
          token.userId = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) || (token.id as string);
        (session.user as Record<string, unknown>).trialEnd = token.trialEnd;
        (session.user as Record<string, unknown>).isMember = token.isMember;
      }
      return session;
    },
  },
  pages: {
    signIn: undefined, // We handle login UI ourselves
  },
  secret: process.env.NEXTAUTH_SECRET,
};
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { AuthService } from "@/server/services/auth.service";
import { env } from "@/server/lib/env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      status: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: string[];
    status: string;
    requiresTotp?: boolean;
  }
}

// NextAuth configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await AuthService.verifyCredentials(
            credentials.email as string,
            credentials.password as string,
            (credentials.totpCode as string) || undefined,
          );

          if (user.requiresTotp) {
            throw new Error("REQUIRES_TOTP");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            status: user.status,
          };
        } catch (error: unknown) {
          if (error instanceof Error && error.message === "REQUIRES_TOTP") {
            throw error;
          }
          if (error && typeof error === "object" && "message" in error) {
            throw new Error(String(error.message));
          }
          return null;
        }
      },
    }),
    ...(env().AUTH_GOOGLE_ID && env().AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: env().AUTH_GOOGLE_ID!,
            clientSecret: env().AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    ...(env().AUTH_GITHUB_ID && env().AUTH_GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: env().AUTH_GITHUB_ID!,
            clientSecret: env().AUTH_GITHUB_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.status = (token.status as string) ?? "ACTIVE";
      }
      return session;
    },
  },
});


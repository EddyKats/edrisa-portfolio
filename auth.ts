import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isStudioAdmin } from "@/lib/auth/admin";

const githubId = process.env.AUTH_GITHUB_ID;
const githubSecret = process.env.AUTH_GITHUB_SECRET;

export const studioAuthConfigured = Boolean(process.env.AUTH_SECRET && githubId && githubSecret);

const previewRedirectProxy =
  process.env.VERCEL_ENV === "preview" ? process.env.AUTH_REDIRECT_PROXY_URL : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  ...(previewRedirectProxy ? { redirectProxyUrl: previewRedirectProxy } : {}),
  providers:
    githubId && githubSecret
      ? [
          GitHub({
            clientId: githubId,
            clientSecret: githubSecret,
          }),
        ]
      : [],
  pages: {
    signIn: "/studio/signin",
    error: "/studio/signin",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/studio/signin") return true;
      if (!pathname.startsWith("/studio")) return true;
      return isStudioAdmin({
        githubLogin: session?.user?.githubLogin,
        githubId: session?.user?.githubId,
      });
    },
    jwt({ token, profile, account }) {
      if (account?.provider !== "github") return token;

      const github = profile as { login?: unknown; id?: unknown } | undefined;
      const login = typeof github?.login === "string" ? github.login : undefined;
      const profileId = github?.id == null ? undefined : String(github.id);
      token.githubLogin = login;
      token.githubId = profileId ?? account.providerAccountId;
      return token;
    },
    session({ session, token }) {
      session.user.githubLogin = typeof token.githubLogin === "string" ? token.githubLogin : undefined;
      session.user.githubId = typeof token.githubId === "string" ? token.githubId : undefined;
      return session;
    },
  },
});

import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      githubLogin?: string;
      githubId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubLogin?: string;
    githubId?: string;
  }
}

import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStudioAdmin } from "@/lib/auth/admin";

export async function requireAdmin() {
  const session = await auth();
  const identity = {
    githubLogin: session?.user?.githubLogin,
    githubId: session?.user?.githubId,
  };

  if (!isStudioAdmin(identity)) {
    redirect("/studio/signin");
  }

  return session;
}

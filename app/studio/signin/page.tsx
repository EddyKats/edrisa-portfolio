import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn, signOut, studioAuthConfigured } from "@/auth";
import { isStudioAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  const allowed = isStudioAdmin({
    githubLogin: session?.user?.githubLogin,
    githubId: session?.user?.githubId,
  });

  if (allowed) redirect("/studio");

  const denied = Boolean(session?.user) || error === "AccessDenied";

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f4f1ec] px-6 text-[#1c120e]" style={{ colorScheme: "light" }}>
      <section className="w-full max-w-md rounded-2xl bg-white px-6 py-8 shadow-[0_16px_50px_rgba(28,18,14,0.08)]">
        <p className="text-xs tracking-[0.18em] text-[#1c120e]/50 uppercase">Edrisa</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Studio</h1>
        {denied ? (
          <p className="mt-4 text-sm leading-relaxed text-[#1c120e]/70">
            This studio only opens for the Edrisa GitHub account.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-[#1c120e]/70">Sign in with GitHub to continue.</p>
        )}
        {studioAuthConfigured ? (
          denied ? (
            <form
              className="mt-6"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/studio/signin" });
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-[#2e211c] px-4 py-2 text-sm font-semibold text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]"
              >
                Sign out
              </button>
            </form>
          ) : (
            <form
              className="mt-6"
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/studio" });
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-[#2e211c] px-4 py-2 text-sm font-semibold text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]"
              >
                Continue with GitHub
              </button>
            </form>
          )
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-[#1c120e]/70">
            GitHub sign-in is not configured yet. Add AUTH_SECRET, AUTH_GITHUB_ID, and AUTH_GITHUB_SECRET to .env.local.
          </p>
        )}
      </section>
    </main>
  );
}

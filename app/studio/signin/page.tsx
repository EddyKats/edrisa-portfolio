import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn, signOut, studioAuthConfigured } from "@/auth";
import { StudioMark } from "@/components/studio/StudioMark";
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
    <main className="studio-app grid min-h-dvh place-items-center px-6" style={{ colorScheme: "light" }}>
      <section className="w-full max-w-md rounded-[1.75rem] bg-white px-7 py-8 shadow-[0_30px_80px_rgba(28,24,64,0.12)]">
        <div className="studio-brand px-0 pb-2">
          <StudioMark />
          <span>Studio</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1c1840]">Sign in</h1>
        {denied ? (
          <p className="mt-4 text-sm leading-relaxed text-[#8a8aa8]">
            This studio only opens for the Edrisa GitHub account.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-[#8a8aa8]">Sign in with GitHub to continue.</p>
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
                className="rounded-full bg-[#6b4dff] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(107,77,255,0.28)]"
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
                className="rounded-full bg-[#6b4dff] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(107,77,255,0.28)]"
              >
                Continue with GitHub
              </button>
            </form>
          )
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-[#8a8aa8]">
            GitHub sign in is not configured yet. Add AUTH_SECRET, AUTH_GITHUB_ID, and AUTH_GITHUB_SECRET to .env.local.
          </p>
        )}
      </section>
    </main>
  );
}

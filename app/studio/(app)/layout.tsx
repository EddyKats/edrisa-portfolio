import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/StudioShell";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ensureStudioContent } from "@/lib/content/ensure-studio";
import { getStudioOverview } from "@/lib/content/overview";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  await ensureStudioContent();
  const overview = await getStudioOverview();

  return (
    <StudioShell
      user={{
        name: session?.user?.name || session?.user?.githubLogin || "Edrisa",
        image: session?.user?.image ?? null,
      }}
      overview={overview}
    >
      {children}
    </StudioShell>
  );
}

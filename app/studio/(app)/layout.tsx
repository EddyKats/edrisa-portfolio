import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/StudioShell";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return <StudioShell>{children}</StudioShell>;
}

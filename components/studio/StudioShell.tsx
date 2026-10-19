import Link from "next/link";
import { Settings } from "lucide-react";
import { signOut } from "@/auth";
import { StudioChrome } from "@/components/studio/StudioChrome";
import type { StudioOverview } from "@/components/studio/StudioRail";

export function StudioShell({
  children,
  user,
  overview,
}: {
  children: React.ReactNode;
  user: { name: string; image: string | null };
  overview: StudioOverview;
}) {
  return (
    <div className="studio-app" style={{ colorScheme: "light" }}>
      <StudioChrome
        user={user}
        overview={overview}
        account={
          <div className="studio-sidebar-foot">
            <p className="studio-nav-kicker">Settings</p>
            <Link href="/studio/settings" className="studio-nav-link">
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              Settings
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/studio/signin" });
              }}
            >
              <button type="submit" className="studio-logout">
                Logout
              </button>
            </form>
          </div>
        }
      >
        {children}
      </StudioChrome>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Mail, Menu, Search } from "lucide-react";
import { studioSearchLinks } from "@/components/studio/studio-links";

export function StudioTopBar({
  user,
  onMenu,
}: {
  user: { name: string; image: string | null };
  onMenu: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return studioSearchLinks.filter((link) => link.label.toLowerCase().includes(value)).slice(0, 6);
  }, [query]);

  return (
    <header className="studio-topbar">
      <button type="button" className="studio-menu-btn" onClick={onMenu} aria-label="Open studio menu">
        <Menu className="size-5" />
      </button>
      <form
        className="studio-search"
        onSubmit={(event) => {
          event.preventDefault();
          const next = matches[0] ?? studioSearchLinks.find((link) => link.label.toLowerCase() === query.trim().toLowerCase());
          if (next) {
            router.push(next.href);
            setQuery("");
          }
        }}
      >
        <Search className="studio-search-icon" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your studio..."
          aria-label="Search studio pages"
        />
        {matches.length > 0 ? (
          <ul className="studio-search-results">
            {matches.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setQuery("")}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </form>
      <div className="studio-topbar-tools">
        <Link href="/studio/contact" className="studio-icon-btn" aria-label="Contact">
          <Mail className="size-4" />
        </Link>
        <Link href="/studio/projects" className="studio-icon-btn" aria-label="Projects">
          <Bell className="size-4" />
        </Link>
        <div className="studio-userchip">
          {user.image ? (
            <Image src={user.image} alt="" width={36} height={36} unoptimized className="studio-userchip-photo" />
          ) : (
            <span className="studio-userchip-fallback">{user.name.slice(0, 1)}</span>
          )}
          <span>{user.name}</span>
        </div>
      </div>
    </header>
  );
}

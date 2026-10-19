"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studioContentLinks, studioOverviewLinks, studioSiteLinks, type StudioLink } from "@/components/studio/studio-links";

function isActive(pathname: string, href: string) {
  return href === "/studio" ? pathname === "/studio" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({ title, links, pathname }: { title: string; links: StudioLink[]; pathname: string }) {
  return (
    <div className="studio-nav-group">
      <p className="studio-nav-kicker">{title}</p>
      <ul>
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={active ? "page" : undefined} className={`studio-nav-link${active ? " is-active" : ""}`}>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StudioNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Studio" className="studio-nav">
      <NavGroup title="Overview" links={studioOverviewLinks} pathname={pathname} />
      <NavGroup title="Content" links={studioContentLinks} pathname={pathname} />
      <div className="studio-nav-group">
        <p className="studio-nav-kicker">Website</p>
        <ul>
          {studioSiteLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} target="_blank" rel="noreferrer" className="studio-nav-person">
                <span className="studio-nav-avatar" aria-hidden="true">
                  {link.label.slice(0, 1)}
                </span>
                <span>
                  <span className="studio-nav-person-name">{link.label}</span>
                  <span className="studio-nav-person-note">{link.note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

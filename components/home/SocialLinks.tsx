import { FaBehance, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import type { PublicSocial } from "@/lib/content/site-shape";

const icons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

export function SocialLinks({
  profiles,
  className = "home-social",
  label = "Social",
  callHref = null,
}: {
  profiles: PublicSocial[];
  className?: string;
  label?: string;
  callHref?: string | null;
}) {
  return (
    <nav aria-label={label} className={className}>
      {profiles.map((item) => {
        const Icon = icons[item.id];
        const label = "iconLabel" in item ? item.iconLabel : item.label;

        return (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            data-brand={item.id}
          >
            <Icon aria-hidden="true" />
          </a>
        );
      })}
      {callHref ? (
        <a href={callHref} aria-label="Call Edrisa" data-brand="call">
          <FaPhone aria-hidden="true" />
        </a>
      ) : null}
    </nav>
  );
}

import { FaBehance, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { socialProfiles } from "@/data/site";

const icons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

export function SocialLinks({
  className = "home-social",
  label = "Social",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      {socialProfiles.map((item) => {
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
    </nav>
  );
}

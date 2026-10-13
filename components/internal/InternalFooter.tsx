import { FaBehance, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { EdrisaLogo } from "@/components/site/EdrisaLogo";
import { getPublicSite } from "@/lib/content/site";
import type { PublicSocial } from "@/lib/content/site-shape";

const socialIcons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

const marqueeCopies = [0, 1, 2];

export async function InternalFooter() {
  const site = await getPublicSite();
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="site-footer mt-16 bg-[#f6f3ef] text-ink">
        <div className="footer-top">
          <p className="footer-kicker">Elsewhere on the internet</p>
          <div className="footer-rule" aria-hidden="true" />
          <ul className="footer-socials">
            {site.socials.map((item) => (
              <li key={item.id}>
                <SocialAction item={item} />
              </li>
            ))}
            {site.callHref ? (
              <li>
                <a href={site.callHref} className="footer-social" aria-label="Call Edrisa">
                  <FaPhone className="footer-social-icon" aria-hidden="true" />
                  <span>Call</span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="footer-marquee mt-12 sm:mt-16" aria-hidden="true">
          <div className="footer-marquee-track">
            <LogoSet />
            <LogoSet />
          </div>
        </div>
      </footer>
      <p className="mt-14 text-center text-[1.15rem] font-medium text-ink">
        © {year} Edrisa. All rights reserved
      </p>
    </>
  );
}

function SocialAction({ item }: { item: PublicSocial }) {
  const Icon = socialIcons[item.id];

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className="footer-social">
      <Icon className="footer-social-icon" aria-hidden="true" />
      <span>{item.label}</span>
    </a>
  );
}

function LogoSet() {
  return (
    <div className="footer-marquee-set">
      {marqueeCopies.map((copy) => (
        <div className="footer-marquee-item" key={copy}>
          <div className="footer-marquee-window">
            <EdrisaLogo className="footer-marquee-logo" />
          </div>
        </div>
      ))}
    </div>
  );
}

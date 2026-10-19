import { SocialLinks } from "@/components/home/SocialLinks";
import { displayFromTelHref } from "@/lib/content/phone";
import type { PublicSocial } from "@/lib/content/site-shape";

export function ContactDetails({
  detailsHeading,
  socialHeading,
  email,
  callHref,
  socials,
}: {
  detailsHeading: string;
  socialHeading: string;
  email: string;
  callHref: string | null;
  socials: PublicSocial[];
}) {
  const whatsapp = socials.find((item) => item.id === "whatsapp");

  return (
    <div className="contact-details">
      <h2 className="about-chapter-title">{detailsHeading}</h2>
      <dl className="contact-channels">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${email}`}>{email}</a>
          </dd>
        </div>
        {callHref ? (
          <div>
            <dt>Call</dt>
            <dd>
              <a href={callHref}>{displayFromTelHref(callHref)}</a>
            </dd>
          </div>
        ) : null}
        {whatsapp ? (
          <div>
            <dt>WhatsApp</dt>
            <dd>
              <a href={whatsapp.href} target="_blank" rel="noopener noreferrer">
                {whatsapp.label}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="about-support mt-6 max-w-[28rem]">
        Start a project on this page. LinkedIn and Behance are for the work of Kasibante Edrisa; WhatsApp is for a
        short brief.
      </p>
      <h2 className="about-chapter-title contact-elsewhere">{socialHeading}</h2>
      <SocialLinks
        profiles={socials}
        className="contact-social mt-5"
        label={socialHeading}
        callHref={callHref}
      />
    </div>
  );
}

import { Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { displayFromTelHref, telFromWhatsapp } from "@/lib/content/phone";
import type { PublicSocial } from "@/lib/content/site-shape";

export function ContactDetails({
  detailsHeading,
  email,
  callHref,
  socials,
}: {
  detailsHeading: string;
  email: string;
  callHref: string | null;
  socials: PublicSocial[];
}) {
  const whatsapp = socials.find((item) => item.id === "whatsapp");
  const whatsappTel = whatsapp ? telFromWhatsapp(whatsapp.href) : null;
  const whatsappValue = whatsappTel
    ? displayFromTelHref(whatsappTel)
    : whatsapp && whatsapp.label !== "WhatsApp"
      ? whatsapp.label
      : "Message";

  return (
    <div className="contact-details">
      <h2 className="about-chapter-title">{detailsHeading}</h2>
      <ul className="contact-methods">
        <li>
          <a className="contact-method" href={`mailto:${email}`}>
            <Mail className="contact-method-icon" strokeWidth={1.6} aria-hidden="true" />
            <span className="contact-method-kicker">Email</span>
            <span className="contact-method-value">
              {email.includes("@") ? (
                <>
                  {email.slice(0, email.indexOf("@") + 1)}
                  <wbr />
                  {email.slice(email.indexOf("@") + 1)}
                </>
              ) : (
                email
              )}
            </span>
          </a>
        </li>
        {callHref ? (
          <li>
            <a className="contact-method" href={callHref}>
              <Phone className="contact-method-icon" strokeWidth={1.6} aria-hidden="true" />
              <span className="contact-method-kicker">Call</span>
              <span className="contact-method-value">{displayFromTelHref(callHref)}</span>
            </a>
          </li>
        ) : null}
        {whatsapp ? (
          <li>
            <a className="contact-method is-whatsapp" href={whatsapp.href} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="contact-method-icon" aria-hidden="true" />
              <span className="contact-method-kicker">WhatsApp</span>
              <span className="contact-method-value">{whatsappValue}</span>
            </a>
          </li>
        ) : null}
      </ul>
      <p className="about-support mt-6 max-w-[28rem]">For project enquiries, email or WhatsApp works best.</p>
    </div>
  );
}

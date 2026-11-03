import type { Metadata } from "next";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactFaq } from "@/components/contact/ContactFaq";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/site/JsonLd";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { contactCopy, contactDetails, contactMeta, splitContactTitle } from "@/data/contact";
import { getPublicContact } from "@/lib/content/contact";
import { toTelHref } from "@/lib/content/phone";
import { publicStoredTitle } from "@/lib/content/jsonld";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getPublicContact();
  const title = publicStoredTitle(contact?.seoTitle, contactMeta.title);
  const description = contact?.seoDescription || contactMeta.description;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/contact" },
    openGraph: { title, description, url: "/contact" },
  };
}

export default async function ContactRoute() {
  const [site, contact] = await Promise.all([getPublicSite(), getPublicContact()]);
  const heading = splitContactTitle(contact?.pageTitle || `${contactCopy.title} ${contactCopy.titleLine}`);
  const email = contact?.email || contactDetails.email;
  const callHref = (contact?.phone ? toTelHref(contact.phone) : null) ?? site.callHref;

  return (
    <InternalPageLayout section="contact">
      <div className="internal-frame px-5 pt-14 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-20">
        <header className="contact-intro">
          <div className="contact-intro-copy">
            <h1 className="about-name font-display tracking-tight">
              <span className="block">{heading.title}</span>
              <span className="block">{heading.titleLine}</span>
            </h1>
            <p className="about-title max-w-[24rem] text-[clamp(1.05rem,1.4vw,1.28rem)] leading-snug font-medium text-ink/82">
              {contact?.subtitle || contactCopy.arrived}
            </p>
            <p className="about-lead mt-6">{contactCopy.subheading}</p>
          </div>
          <svg className="contact-intro-mark" viewBox="0 0 280 220" aria-hidden="true">
            <defs>
              <linearGradient id="contact-mark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FFF200" />
                <stop offset="0.45" stopColor="#FFAE16" />
                <stop offset="1" stopColor="#F25C0A" />
              </linearGradient>
            </defs>
            <circle cx="168" cy="96" r="72" fill="none" stroke="url(#contact-mark)" strokeWidth="10" />
            <circle cx="92" cy="148" r="34" fill="url(#contact-mark)" opacity="0.9" />
            <path d="M36 40h150M36 40v92" fill="none" stroke="#1c120e" strokeOpacity="0.18" strokeWidth="1.5" />
          </svg>
        </header>
        <div className="contact-layout">
          <ContactDetails
            detailsHeading={contactCopy.detailsHeading}
            email={email}
            callHref={callHref}
            socials={site.socials}
          />
          <ContactForm heading={contact?.formHeading || contactCopy.formHeading} inbox={email} />
        </div>
        <ContactFaq heading={contactCopy.faqHeading} items={contactCopy.faq} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: contactCopy.faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}

import type { Metadata } from "next";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { LocationCard } from "@/components/contact/LocationCard";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { contactCopy, contactMeta } from "@/data/contact";

export const metadata: Metadata = {
  title: { absolute: contactMeta.title },
  description: contactMeta.description,
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactRoute() {
  return (
    <InternalPageLayout section="contact">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{contactCopy.title}</InternalTitle>
        <p className="mx-auto mt-4 max-w-md text-center text-[1.05rem] leading-relaxed text-ink/70">
          {contactCopy.subheading}
        </p>
        <div className="mt-16 grid items-start gap-14 split:grid-cols-2 split:gap-16">
          <ContactDetails />
          <ContactForm />
        </div>
        <LocationCard />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}

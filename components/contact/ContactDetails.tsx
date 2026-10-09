import { SocialLinks } from "@/components/home/SocialLinks";
import { contactCopy, contactDetails } from "@/data/contact";

export function ContactDetails() {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{contactCopy.detailsHeading}</h2>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">Email</dt>
          <dd className="mt-1">
            <a
              href={`mailto:${contactDetails.email}`}
              className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {contactDetails.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">Phone</dt>
          <dd className="mt-1 text-ink/70">
            {contactDetails.phone ? (
              <a
                href={`tel:${contactDetails.phone}`}
                className="rounded-sm text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {contactDetails.phone}
              </a>
            ) : (
              "Not listed yet"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">Location</dt>
          <dd className="mt-1">{contactDetails.location}</dd>
        </div>
      </dl>
      <h2 className="mt-12 text-xl font-semibold tracking-tight">{contactCopy.socialHeading}</h2>
      <SocialLinks className="contact-social mt-4" label={contactCopy.socialHeading} />
    </div>
  );
}

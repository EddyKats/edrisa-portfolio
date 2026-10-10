import { SocialLinks } from "@/components/home/SocialLinks";
import type { PublicSocial } from "@/lib/content/site-shape";

export function ContactDetails({
  detailsHeading,
  socialHeading,
  email,
  phone,
  location,
  socials,
}: {
  detailsHeading: string;
  socialHeading: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  socials: PublicSocial[];
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{detailsHeading}</h2>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">Email</dt>
          <dd className="mt-1">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {email}
              </a>
            ) : (
              "Not listed yet"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">Phone</dt>
          <dd className="mt-1 text-ink/70">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="rounded-sm text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {phone}
              </a>
            ) : (
              "Not listed yet"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">Location</dt>
          <dd className="mt-1">{location ?? "Not listed yet"}</dd>
        </div>
      </dl>
      <h2 className="mt-12 text-xl font-semibold tracking-tight">{socialHeading}</h2>
      <SocialLinks profiles={socials} className="contact-social mt-4" label={socialHeading} />
    </div>
  );
}

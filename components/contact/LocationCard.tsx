import { MapPin } from "lucide-react";
import { contactCopy, contactDetails } from "@/data/contact";

export function LocationCard() {
  return (
    <section
      aria-labelledby="contact-location"
      className="mt-16 flex items-start gap-4 rounded-2xl border border-ink/10 bg-white/70 px-6 py-6"
    >
      <MapPin className="mt-0.5 size-5 shrink-0 text-ink/70" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <h2 id="contact-location" className="text-lg font-semibold tracking-tight">
          {contactDetails.location}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">{contactCopy.locationNote}</p>
      </div>
    </section>
  );
}

import Image from "next/image";
import { clientSlots, servicesCopy } from "@/data/services";

export function ClientStrip() {
  return (
    <section aria-labelledby="services-clients-title" className="mt-24 sm:mt-28">
      <h2
        id="services-clients-title"
        className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
      >
        {servicesCopy.clientsHeading}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-ink/60">
        {servicesCopy.clientsNote}
      </p>
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {clientSlots.map((slot) => (
          <li
            key={slot.id}
            className="grid h-24 place-items-center overflow-hidden rounded-xl border border-dashed border-ink/15 bg-white/60 text-xs tracking-[0.14em] text-ink/40 uppercase"
          >
            {slot.src ? (
              <Image src={slot.src} alt={slot.alt} width={180} height={72} className="max-h-12 w-auto object-contain" />
            ) : (
              <span>Logo</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

import Image from "next/image";

const emptySlots = ["client-01", "client-02", "client-03", "client-04", "client-05", "client-06"];

export function ClientStrip({
  heading,
  note,
  clients,
}: {
  heading: string;
  note: string;
  clients: { id: string; name: string; logoUrl: string | null; website: string | null }[];
}) {
  const slots = clients.length > 0 ? clients : emptySlots.map((id) => ({ id, name: "Logo", logoUrl: null, website: null }));

  return (
    <section aria-labelledby="services-clients-title" className="mt-24 sm:mt-28">
      <h2
        id="services-clients-title"
        className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
      >
        {heading}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-ink/60">{note}</p>
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {slots.map((slot) => {
          const frame = (
            <span className="grid h-24 w-full place-items-center overflow-hidden rounded-xl border border-dashed border-ink/15 bg-white/60 text-xs tracking-[0.14em] text-ink/40 uppercase">
              {slot.logoUrl ? (
                <Image src={slot.logoUrl} alt={slot.name} width={180} height={72} className="max-h-12 w-auto object-contain" />
              ) : (
                <span>{clients.length > 0 ? slot.name : "Logo"}</span>
              )}
            </span>
          );
          return (
            <li key={slot.id}>
              {slot.website ? (
                <a href={slot.website} target="_blank" rel="noopener noreferrer" className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  {frame}
                </a>
              ) : (
                frame
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Image from "next/image";
import { serviceClientRows } from "@/data/clients";

export function ClientStrip({
  heading,
  clients,
}: {
  heading: string;
  clients?: { id: string; name: string; src: string }[];
}) {
  const listed = clients && clients.length > 0 ? clients : serviceClientRows.flat().map((client) => ({ id: client.id, name: client.name, src: client.src }));
  const split = Math.ceil(listed.length / 2) || listed.length;
  const rows = listed.length > 6 ? [listed.slice(0, split), listed.slice(split)] : [listed];

  return (
    <section aria-labelledby="services-places-title" className="services-block">
      <h2 id="services-places-title" className="about-chapter-title">
        {heading}
      </h2>
      <div className="client-marquee-wrap">
        {rows.map((row, index) => (
          <div
            key={row[0]?.id ?? index}
            className={index % 2 === 1 ? "client-marquee client-marquee--reverse" : "client-marquee"}
          >
            <div className="client-marquee-track">
              {[...row, ...row].map((client, copy) => (
                <div key={`${client.id}-${copy}`} className="client-marquee-item">
                  <Image
                    src={client.src}
                    alt={client.name}
                    width={200}
                    height={80}
                    loading="lazy"
                    sizes="200px"
                    className="client-marquee-img"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

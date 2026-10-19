import Image from "next/image";
import { serviceClientRows } from "@/data/clients";

export function ClientStrip({ heading }: { heading: string }) {
  return (
    <section aria-labelledby="services-places-title" className="services-block">
      <h2 id="services-places-title" className="about-chapter-title">
        {heading}
      </h2>
      <div className="client-marquee-wrap">
        {serviceClientRows.map((row, index) => (
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

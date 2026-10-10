import { ServicesStudio } from "@/components/studio/ServicesStudio";
import { listStudioCatalog } from "@/lib/content/catalog";
import { getPublicCta } from "@/lib/content/cta";

export default async function StudioServicesPage() {
  const [{ services, packages }, cta] = await Promise.all([listStudioCatalog(), getPublicCta("services")]);

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1c120e]/70">
        Published services, packages, and the services call to action appear on the public page.
      </p>
      <div className="mt-8">
        <ServicesStudio
          services={services.map((service) => ({
            id: service.id,
            title: service.title,
            slug: service.slug,
            description: service.description,
            icon: service.icon,
            published: service.published,
          }))}
          packages={packages.map((entry) => ({
            id: entry.id,
            title: entry.title,
            description: entry.description ?? "",
            buttonLabel: entry.buttonLabel,
            published: entry.published,
            items: entry.items.map((item) => ({ id: item.id, label: item.label })),
          }))}
          cta={{
            heading: cta?.heading ?? "",
            body: cta?.body ?? "",
            buttonLabel: cta?.buttonLabel ?? "",
            buttonHref: cta?.buttonHref ?? "/contact",
          }}
        />
      </div>
    </section>
  );
}

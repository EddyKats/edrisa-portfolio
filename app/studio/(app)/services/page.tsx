import { ServicesStudio } from "@/components/studio/ServicesStudio";
import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { listStudioCatalog } from "@/lib/content/catalog";
import { getPublicCta } from "@/lib/content/cta";

export default async function StudioServicesPage() {
  const [{ services, packages }, cta] = await Promise.all([listStudioCatalog(), getPublicCta("services")]);

  return (
    <section>
      <StudioPageHead
        title="Services"
        note="Published services, capability lists, and the call to action appear on /services."
      />
      <div>
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

import { ClientsStudio } from "@/components/studio/ClientsStudio";
import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { listStudioCatalog } from "@/lib/content/catalog";

export default async function StudioClientsPage() {
  const { clients } = await listStudioCatalog();

  return (
    <section>
      <StudioPageHead title="Clients" note="Published client logos appear in the Services marquee, in this order." />
      <div>
        <ClientsStudio
          clients={clients.map((client) => ({
            id: client.id,
            name: client.name,
            website: client.website ?? "",
            logoUrl: client.logoUrl,
            published: client.published,
          }))}
        />
      </div>
    </section>
  );
}

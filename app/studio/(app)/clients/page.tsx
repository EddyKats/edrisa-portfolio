import { ClientsStudio } from "@/components/studio/ClientsStudio";
import { listStudioCatalog } from "@/lib/content/catalog";

export default async function StudioClientsPage() {
  const { clients } = await listStudioCatalog();

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1c120e]/70">
        Logos appear on Services after a client is published. Nothing is invented here.
      </p>
      <div className="mt-8">
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

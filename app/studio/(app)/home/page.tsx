import { SimpleForm } from "@/components/studio/SimpleForm";
import { ImageField } from "@/components/studio/editor";
import { confirmHomePortrait, saveHome } from "@/app/studio/(app)/home/actions";
import { getStudioHome } from "@/lib/content/home";

export default async function StudioHomePage() {
  const home = await getStudioHome();

  return (
    <section className="grid max-w-2xl gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#1c120e]/70">
          Tile labels and the portrait can change. The grid, gradients, and motion stay in code.
        </p>
      </div>
      <SimpleForm
        action={saveHome}
        fields={[
          { name: "aboutTileLabel", label: "About tile", defaultValue: home.aboutTileLabel },
          { name: "servicesTileLabel", label: "Services tile", defaultValue: home.servicesTileLabel },
          { name: "contactTileLabel", label: "Contact tile", defaultValue: home.contactTileLabel },
          { name: "portfolioTileLabel", label: "Portfolio tile", defaultValue: home.portfolioTileLabel },
        ]}
      />
      <ImageField
        label="Portrait"
        url={home.portraitUrl}
        scope="home-portrait"
        ownerId="home"
        confirm={confirmHomePortrait}
      />
    </section>
  );
}

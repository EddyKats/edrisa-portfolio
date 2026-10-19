import { SimpleForm } from "@/components/studio/SimpleForm";
import { HomePortraits } from "@/components/studio/HomePortraits";
import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { saveHome } from "@/app/studio/(app)/home/actions";
import { getStudioHome } from "@/lib/content/home";

export default async function StudioHomePage() {
  const home = await getStudioHome();
  const mode = home.portraitMode === "sequence" ? "sequence" : "single";

  return (
    <section>
      <StudioPageHead
        title="Home"
        note="Tile labels and portraits save to the public homepage. The grid, gradients, and motion stay in code."
      />
      <div className="studio-stack">
        <SimpleForm
          action={saveHome}
          fields={[
            { name: "aboutTileLabel", label: "About tile", defaultValue: home.aboutTileLabel },
            { name: "servicesTileLabel", label: "Services tile", defaultValue: home.servicesTileLabel },
            { name: "contactTileLabel", label: "Contact tile", defaultValue: home.contactTileLabel },
            { name: "portfolioTileLabel", label: "Portfolio tile", defaultValue: home.portfolioTileLabel },
          ]}
        />
        <HomePortraits mode={mode} portraitUrl={home.portraitUrl} portraits={home.portraits} />
      </div>
    </section>
  );
}

import { SimpleForm } from "@/components/studio/SimpleForm";
import { HomeMediaBoard } from "@/components/studio/HomeMediaBoard";
import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { saveHome } from "@/app/studio/(app)/home/actions";
import { getStudioHome } from "@/lib/content/home";

export default async function StudioHomePage() {
  const home = await getStudioHome();

  return (
    <section>
      <StudioPageHead
        title="Home"
        note="Each homepage panel can use one still, a changing set of pictures, or video. Labels and media save to the live site. The grid and motion stay in code."
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
        <HomeMediaBoard home={home} />
      </div>
    </section>
  );
}

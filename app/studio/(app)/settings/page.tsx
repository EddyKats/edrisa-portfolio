import { SimpleForm } from "@/components/studio/SimpleForm";
import { ImageField } from "@/components/studio/editor";
import { confirmSiteLogo, savePortfolioCta, saveSettings } from "@/app/studio/(app)/settings/actions";
import { getPublicCta } from "@/lib/content/cta";
import { getStudioSettings } from "@/lib/content/site";

export default async function StudioSettingsPage() {
  const [settings, cta] = await Promise.all([getStudioSettings(), getPublicCta("portfolio")]);

  return (
    <section className="grid max-w-2xl gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Site settings</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#1c120e]/70">
          Social links, footer copy, and default SEO are shared across the site.
        </p>
      </div>
      <SimpleForm
        action={saveSettings}
        fields={[
          { name: "siteName", label: "Site name", defaultValue: settings.siteName },
          { name: "siteUrl", label: "Site URL", defaultValue: settings.siteUrl },
          { name: "behanceUrl", label: "Behance URL", defaultValue: settings.behanceUrl },
          { name: "linkedinUrl", label: "LinkedIn URL", defaultValue: settings.linkedinUrl },
          { name: "whatsappUrl", label: "WhatsApp URL", defaultValue: settings.whatsappUrl },
          { name: "contactEmail", label: "Contact email", defaultValue: settings.contactEmail ?? "" },
          { name: "contactPhone", label: "Contact phone", defaultValue: settings.contactPhone ?? "" },
          { name: "location", label: "Location", defaultValue: settings.location ?? "" },
          { name: "footerText", label: "Footer text", defaultValue: settings.footerText ?? "", area: true },
          { name: "footerSecondaryText", label: "Footer secondary text", defaultValue: settings.footerSecondaryText ?? "" },
          { name: "defaultSeoTitle", label: "Default SEO title", defaultValue: settings.defaultSeoTitle ?? "" },
          { name: "defaultSeoDescription", label: "Default SEO description", defaultValue: settings.defaultSeoDescription ?? "", area: true },
        ]}
      />
      <ImageField
        label="Logo"
        url={settings.logoUrl}
        scope="home-logo"
        ownerId="home"
        confirm={confirmSiteLogo}
        confirmReplace
      />
      <SimpleForm
        action={savePortfolioCta}
        title="Portfolio call to action"
        fields={[
          { name: "heading", label: "Heading", defaultValue: cta?.heading ?? "" },
          { name: "body", label: "Body", defaultValue: cta?.body ?? "", area: true },
          { name: "buttonLabel", label: "Button label", defaultValue: cta?.buttonLabel ?? "" },
          { name: "buttonHref", label: "Button link", defaultValue: cta?.buttonHref ?? "/contact" },
        ]}
      />
    </section>
  );
}

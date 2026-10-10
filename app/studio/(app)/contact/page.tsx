import { SimpleForm } from "@/components/studio/SimpleForm";
import { saveContact } from "@/app/studio/(app)/contact/actions";
import { getStudioContact } from "@/lib/content/contact";

export default async function StudioContactPage() {
  const contact = await getStudioContact();

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1c120e]/70">
        The form still checks entries locally. It does not send email.
      </p>
      <div className="mt-8">
        <SimpleForm
          action={saveContact}
          fields={[
            { name: "pageTitle", label: "Page title", defaultValue: contact.pageTitle },
            { name: "subtitle", label: "Subtitle", defaultValue: contact.subtitle ?? "", area: true },
            { name: "location", label: "Location", defaultValue: contact.location ?? "" },
            { name: "email", label: "Email", defaultValue: contact.email ?? "" },
            { name: "phone", label: "Phone", defaultValue: contact.phone ?? "" },
            { name: "formHeading", label: "Form heading", defaultValue: contact.formHeading ?? "" },
            { name: "socialHeading", label: "Social heading", defaultValue: contact.socialHeading ?? "" },
            { name: "seoTitle", label: "SEO title", defaultValue: contact.seoTitle ?? "" },
            { name: "seoDescription", label: "SEO description", defaultValue: contact.seoDescription ?? "", area: true },
          ]}
        />
      </div>
    </section>
  );
}

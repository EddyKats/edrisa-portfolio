import { SimpleForm } from "@/components/studio/SimpleForm";
import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { saveContact } from "@/app/studio/(app)/contact/actions";
import { getStudioContact } from "@/lib/content/contact";

export default async function StudioContactPage() {
  const contact = await getStudioContact();

  return (
    <section>
      <StudioPageHead
        title="Contact"
        note="Title, the line under it, email, and form copy appear on /contact. Location is not shown on the public page."
      />
      <div>
        <SimpleForm
          action={saveContact}
          fields={[
            { name: "pageTitle", label: "Page title", defaultValue: contact.pageTitle },
            { name: "subtitle", label: "Line under the title", defaultValue: contact.subtitle ?? "", area: true },
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

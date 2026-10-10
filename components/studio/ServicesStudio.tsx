"use client";

import { useActionState } from "react";
import {
  removeItem,
  removePackage,
  removeService,
  reorderItem,
  reorderPackage,
  reorderService,
  saveItem,
  savePackageRecord,
  saveServiceRecord,
  saveServicesCta,
} from "@/app/studio/(app)/services/actions";
import { OrderButtons, PublishBadge, SaveButton, Status, controlClass } from "@/components/studio/editor";

type ServiceRow = { id: string; title: string; slug: string; description: string; icon: string; published: boolean };
type ItemRow = { id: string; label: string };
type PackageRow = {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  published: boolean;
  items: ItemRow[];
};

export function ServicesStudio({
  services,
  packages,
  cta,
}: {
  services: ServiceRow[];
  packages: PackageRow[];
  cta: { heading: string; body: string; buttonLabel: string; buttonHref: string };
}) {
  return (
    <div className="grid max-w-2xl gap-10">
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Services</h2>
        {services.length === 0 ? <p className="text-sm text-[#1c120e]/60">No services yet.</p> : null}
        {services.map((service) => (
          <ServiceForm key={service.id} service={service} />
        ))}
        <ServiceForm />
      </section>
      <section className="grid gap-4 border-t border-[#1c120e]/10 pt-8">
        <h2 className="text-lg font-semibold">Capability packages</h2>
        {packages.map((entry) => (
          <PackageForm key={entry.id} entry={entry} />
        ))}
        <PackageForm />
      </section>
      <CtaForm cta={cta} />
    </div>
  );
}

function ServiceForm({ service }: { service?: ServiceRow }) {
  const [state, action] = useActionState(saveServiceRecord, {});
  const [removeState, removeAction] = useActionState(removeService, {});
  return (
    <div className="grid gap-3 rounded-2xl border border-[#1c120e]/10 p-4">
      <div className="flex items-center justify-between">
        {service ? <PublishBadge published={service.published} /> : <p className="text-sm font-semibold">New service</p>}
        {service ? <OrderButtons action={(direction) => reorderService(service.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <Status state={state} />
        <Field name="title" label="Title" defaultValue={service?.title ?? ""} />
        <Field name="slug" label="Slug" defaultValue={service?.slug ?? ""} />
        <Area name="description" label="Description" defaultValue={service?.description ?? ""} />
        <label className="grid gap-1 text-sm font-medium">
          Icon
          <select name="icon" defaultValue={service?.icon ?? "layers"} className={controlClass}>
            <option value="gem">Gem</option>
            <option value="zap">Zap</option>
            <option value="layers">Layers</option>
          </select>
        </label>
        <Published checked={service?.published ?? false} />
        <SaveButton label={service ? "Save service" : "Add service"} />
      </form>
      {service ? <DeleteForm id={service.id} action={removeAction} state={removeState} /> : null}
    </div>
  );
}

function PackageForm({ entry }: { entry?: PackageRow }) {
  const [state, action] = useActionState(savePackageRecord, {});
  const [removeState, removeAction] = useActionState(removePackage, {});
  const [itemState, itemAction] = useActionState(saveItem, {});
  return (
    <div className="grid gap-3 rounded-2xl border border-[#1c120e]/10 p-4">
      <div className="flex items-center justify-between">
        {entry ? <PublishBadge published={entry.published} /> : <p className="text-sm font-semibold">New package</p>}
        {entry ? <OrderButtons action={(direction) => reorderPackage(entry.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
        <Status state={state} />
        <Field name="title" label="Title" defaultValue={entry?.title ?? ""} />
        <Area name="description" label="Description" defaultValue={entry?.description ?? ""} />
        <Field name="buttonLabel" label="Button label" defaultValue={entry?.buttonLabel ?? ""} />
        <Published checked={entry?.published ?? false} />
        <SaveButton label={entry ? "Save package" : "Add package"} />
      </form>
      {entry ? (
        <div className="grid gap-2">
          {entry.items.map((item) => (
            <ItemForm key={item.id} packageId={entry.id} item={item} />
          ))}
          <form action={itemAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="packageId" value={entry.id} />
            <Field name="label" label="New item" defaultValue="" />
            <SaveButton label="Add item" />
            <Status state={itemState} />
          </form>
          <DeleteForm id={entry.id} action={removeAction} state={removeState} />
        </div>
      ) : null}
    </div>
  );
}

function ItemForm({ packageId, item }: { packageId: string; item: ItemRow }) {
  const [state, action] = useActionState(saveItem, {});
  const [removeState, removeAction] = useActionState(removeItem, {});
  return (
    <div className="grid gap-2 rounded-xl bg-[#1c120e]/4 p-3">
      <div className="flex justify-end">
        <OrderButtons action={(direction) => reorderItem(item.id, direction)} />
      </div>
      <form action={action} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="packageId" value={packageId} />
        <Field name="label" label="Item" defaultValue={item.label} />
        <SaveButton label="Save item" />
      </form>
      <Status state={state} />
      <DeleteForm id={item.id} action={removeAction} state={removeState} />
    </div>
  );
}

function CtaForm({ cta }: { cta: { heading: string; body: string; buttonLabel: string; buttonHref: string } }) {
  const [state, action] = useActionState(saveServicesCta, {});
  return (
    <form action={action} className="grid gap-3 border-t border-[#1c120e]/10 pt-8">
      <h2 className="text-lg font-semibold">Services call to action</h2>
      <Status state={state} />
      <Field name="heading" label="Heading" defaultValue={cta.heading} />
      <Area name="body" label="Body" defaultValue={cta.body} />
      <Field name="buttonLabel" label="Button label" defaultValue={cta.buttonLabel} />
      <Field name="buttonHref" label="Button link" defaultValue={cta.buttonHref} />
      <SaveButton />
    </form>
  );
}

function DeleteForm({
  id,
  action,
  state,
}: {
  id: string;
  action: (formData: FormData) => void;
  state: { error?: string; ok?: boolean; warning?: string };
}) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Status state={state} />
      <input name="confirm" placeholder="Type delete" className={controlClass} />
      <SaveButton label="Delete" />
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid min-w-0 flex-1 gap-1 text-sm font-medium">
      {label}
      <input name={name} defaultValue={defaultValue} className={controlClass} />
    </label>
  );
}

function Area({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={3} className={controlClass} />
    </label>
  );
}

function Published({ checked }: { checked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="published" defaultChecked={checked} />
      Published
    </label>
  );
}

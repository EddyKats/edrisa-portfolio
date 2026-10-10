"use client";

import { useActionState } from "react";
import type { StudioState } from "@/lib/studio/form";
import { SaveButton, Status, controlClass } from "@/components/studio/editor";

export function SimpleForm({
  action,
  fields,
  title,
}: {
  action: (state: StudioState, formData: FormData) => Promise<StudioState>;
  title?: string;
  fields: { name: string; label: string; defaultValue: string; area?: boolean }[];
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="grid max-w-2xl gap-4">
      {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <Status state={state} />
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm font-medium">
          {field.label}
          {field.area ? (
            <textarea name={field.name} defaultValue={field.defaultValue} rows={4} className={controlClass} />
          ) : (
            <input name={field.name} defaultValue={field.defaultValue} className={controlClass} />
          )}
        </label>
      ))}
      <SaveButton />
    </form>
  );
}

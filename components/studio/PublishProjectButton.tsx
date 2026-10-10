"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { publishProject, type ProjectActionState } from "@/app/studio/(app)/projects/actions";

export function PublishProjectButton({ id, published }: { id: string; published: boolean }) {
  const [state, action] = useActionState<ProjectActionState, FormData>(publishProject, {});

  return (
    <form action={action} className="flex flex-col items-start">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={published ? "false" : "true"} />
      <PublishButton published={published} />
      {state.error ? <p className="mt-1 text-xs text-[#8a3b2b]">{state.error}</p> : null}
    </form>
  );
}

function PublishButton({ published }: { published: boolean }) {
  const { pending } = useFormStatus();
  let label = "Publish";
  if (pending) label = "Saving...";
  else if (published) label = "Unpublish";

  return (
    <button type="submit" disabled={pending} className="rounded-full px-3 py-1.5 hover:bg-black/5 disabled:opacity-60">
      {label}
    </button>
  );
}

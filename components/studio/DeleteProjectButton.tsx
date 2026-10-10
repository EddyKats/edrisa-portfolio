"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProjectActionState } from "@/app/studio/(app)/projects/actions";
import { deleteProject } from "@/app/studio/(app)/projects/actions";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ProjectActionState, FormData>(deleteProject, {});

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full px-3 py-1.5 text-sm text-[#8a3b2b] hover:bg-[#8a3b2b]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a3b2b]"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="confirm" value="delete" />
      <p className="max-w-xs text-sm text-[#1c120e]/70">Delete {title}? This cannot be undone.</p>
      {state.error ? <p className="text-sm text-[#8a3b2b]">{state.error}</p> : null}
      <div className="flex gap-2">
        <ConfirmDeleteButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1.5 text-sm text-[#1c120e]/70 hover:bg-black/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#8a3b2b] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete project"}
    </button>
  );
}

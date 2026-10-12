"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { EyeOff, Globe } from "lucide-react";
import { publishProject, type ProjectActionState } from "@/app/studio/(app)/projects/actions";

export function PublishProjectButton({
  id,
  published,
  tone = "text",
}: {
  id: string;
  published: boolean;
  tone?: "text" | "header";
}) {
  const router = useRouter();
  const [state, action] = useActionState<ProjectActionState, FormData>(publishProject, {});

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={action} className="flex flex-col items-start">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={published ? "false" : "true"} />
      <PublishButton published={published} tone={tone} />
      {state.error ? <p className="mt-1 text-xs text-[#8a3b2b]">{state.error}</p> : null}
    </form>
  );
}

function PublishButton({ published, tone }: { published: boolean; tone: "text" | "header" }) {
  const { pending } = useFormStatus();
  let label = "Publish";
  if (pending) label = "Saving...";
  else if (published) label = "Unpublish";

  const header = tone === "header";
  const Icon = published ? EyeOff : Globe;

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        header
          ? `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c] disabled:opacity-60 ${
              published ? "border border-[#2e211c]/20 bg-white" : "bg-[#2e211c] text-[#f7f1ea]"
            }`
          : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c] disabled:opacity-60"
      }
    >
      {header ? <Icon className="size-4" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}

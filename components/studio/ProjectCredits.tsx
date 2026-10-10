"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { removeCredit, reorderCredit, saveCredit, type DetailState } from "@/app/studio/(app)/projects/detail-actions";

type Credit = { id: string; label: string; value: string };

export function ProjectCredits({ projectId, credits }: { projectId: string; credits: Credit[] }) {
  return (
    <div className="mt-4 grid max-w-2xl gap-4">
      <ul className="grid gap-3">
        {credits.map((credit, index) => (
          <CreditRow key={credit.id} credit={credit} index={index} total={credits.length} />
        ))}
      </ul>
      <CreditForm projectId={projectId} />
    </div>
  );
}

function CreditRow({ credit, index, total }: { credit: Credit; index: number; total: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(saveCredit, {});
  const [moveState, setMoveState] = useState<DetailState>({});

  async function move(direction: "up" | "down") {
    const saved = await reorderCredit(credit.id, direction);
    setMoveState(saved.ok ? { ok: true } : { error: saved.error ?? "The credits could not be reordered." });
    if (saved.ok) router.refresh();
  }

  if (!editing) {
    return (
      <li className="rounded-2xl bg-white p-4">
        <p className="text-sm font-semibold">{credit.label}</p>
        <p className="mt-1 text-sm text-[#1c120e]/70">{credit.value}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <button type="button" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button type="button" disabled={index === 0} onClick={() => void move("up")}>
            Move up
          </button>
          <button type="button" disabled={index === total - 1} onClick={() => void move("down")}>
            Move down
          </button>
          <RemoveCreditButton creditId={credit.id} />
        </div>
        <Status state={moveState} />
      </li>
    );
  }

  return (
    <li>
      <form action={action} className="grid gap-2 rounded-2xl bg-white p-4">
        <input type="hidden" name="creditId" value={credit.id} />
        <label className="grid gap-1 text-sm">
          Label
          <input name="label" defaultValue={credit.label} required className={controlClass} />
        </label>
        <label className="grid gap-1 text-sm">
          Value
          <input name="value" defaultValue={credit.value} required className={controlClass} />
        </label>
        <Status state={state} />
        <div className="flex gap-3">
          <SaveButton label="Save credit" />
          <button type="button" className="text-sm" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}

function CreditForm({ projectId }: { projectId: string }) {
  const [state, action] = useActionState(saveCredit, {});
  return (
    <form action={action} className="grid gap-2 rounded-2xl bg-white p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <h3 className="text-sm font-semibold">Add a credit</h3>
      <label className="grid gap-1 text-sm">
        Label
        <input name="label" required className={controlClass} placeholder="Photography" />
      </label>
      <label className="grid gap-1 text-sm">
        Value
        <input name="value" required className={controlClass} placeholder="Name" />
      </label>
      <Status state={state} />
      <SaveButton label="Add credit" />
    </form>
  );
}

function RemoveCreditButton({ creditId }: { creditId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(removeCredit, {});
  if (!open) {
    return (
      <button type="button" className="text-[#8a3b2b]" onClick={() => setOpen(true)}>
        Remove
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="creditId" value={creditId} />
      <input type="hidden" name="confirm" value="delete" />
      <span>Remove this credit?</span>
      <ConfirmButton />
      <button type="button" onClick={() => setOpen(false)}>
        Cancel
      </button>
      <Status state={state} />
    </form>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="font-semibold text-[#8a3b2b] disabled:opacity-60">
      {pending ? "Saving..." : "Remove"}
    </button>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-fit rounded-full bg-[#2e211c] px-3 py-1.5 text-sm font-semibold text-[#f7f1ea] disabled:opacity-60">
      {pending ? "Saving..." : label}
    </button>
  );
}

function Status({ state }: { state: DetailState }) {
  if (state.error) return <p className="text-sm text-[#8a3b2b]">{state.error}</p>;
  if (state.ok) return <p className="text-sm">Saved.</p>;
  return null;
}

const controlClass = "w-full rounded-lg border border-[#1c120e]/15 bg-white px-3 py-2 text-sm";

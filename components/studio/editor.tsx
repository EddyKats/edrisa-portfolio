"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { prepareContentUpload } from "@/app/studio/(app)/media-actions";
import type { StudioState } from "@/lib/studio/form";
import { maxImageLabel, type ContentAssetScope } from "@/lib/storage/validation";

export const controlClass =
  "w-full min-w-0 rounded-xl border border-[#ececf6] bg-white px-3 py-2 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4dff]";

export function Status({ state }: { state: StudioState }) {
  if (state.error) {
    return (
      <p className="studio-note is-error" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.warning) {
    return (
      <p className="studio-note is-error" role="status">
        {state.warning}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p className="studio-note is-ok" role="status">
        Saved.
      </p>
    );
  }
  return null;
}

export function SaveButton({ label = "Save", tone = "primary" }: { label?: string; tone?: "primary" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={tone === "danger" ? "studio-btn-danger" : "studio-btn-primary"}>
      {pending ? "Saving..." : label}
    </button>
  );
}

export function OrderButtons({
  action,
}: {
  action: (direction: "up" | "down") => Promise<StudioState>;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function move(direction: "up" | "down") {
    setPending(true);
    const state = await action(direction);
    if (state.ok) router.refresh();
    setPending(false);
  }

  return (
    <div className="studio-order">
      <button type="button" disabled={pending} onClick={() => void move("up")}>
        Up
      </button>
      <button type="button" disabled={pending} onClick={() => void move("down")}>
        Down
      </button>
    </div>
  );
}

export function PublishBadge({ published }: { published: boolean }) {
  return <span className={published ? "studio-pill is-live" : "studio-pill"}>{published ? "Published" : "Draft"}</span>;
}

export function ImageField({
  label,
  url,
  scope,
  ownerId,
  confirm,
  remove,
  confirmReplace = false,
}: {
  label: string;
  url: string | null;
  scope: ContentAssetScope;
  ownerId: string;
  confirm: (key: string) => Promise<StudioState>;
  remove?: () => Promise<StudioState>;
  confirmReplace?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<StudioState>({});
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [allowReplace, setAllowReplace] = useState(false);

  function finish(next: StudioState) {
    setState(next);
    if (next.ok || next.warning) router.refresh();
  }

  async function upload(file: File) {
    if (confirmReplace && url && !allowReplace) {
      setState({ error: "Confirm that you want to replace the logo." });
      return;
    }
    setBusy(true);
    setState({});
    const ticket = await prepareContentUpload(scope, ownerId, { type: file.type, size: file.size });
    if (!ticket.uploadUrl || !ticket.key || !ticket.contentType) {
      setState({ error: ticket.error ?? "Upload failed." });
      setBusy(false);
      return;
    }
    const response = await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": ticket.contentType },
      body: file,
    }).catch(() => null);
    if (!response?.ok) {
      setState({ error: "Upload failed." });
      setBusy(false);
      return;
    }
    finish(await confirm(ticket.key));
    setBusy(false);
  }

  return (
    <div className="studio-card studio-media-field">
      <p className="studio-media-label">{label}</p>
      <Status state={state} />
      {url ? (
        <div className="studio-media-preview">
          <Image src={url} alt="" fill className="object-contain" sizes="480px" />
        </div>
      ) : (
        <p className="studio-empty">No image yet.</p>
      )}
      <label className="studio-file">
        <span className="sr-only">{url ? `Replace ${label}` : `Upload ${label}`}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {confirmReplace && url ? (
        <label className="studio-check">
          <input type="checkbox" checked={allowReplace} onChange={(event) => setAllowReplace(event.target.checked)} />
          Replace the current logo
        </label>
      ) : null}
      <p className="studio-help">JPEG, PNG, WebP, or AVIF. {maxImageLabel} maximum. Video is not supported.</p>
      {remove && url ? (
        confirming ? (
          <button
            type="button"
            className="studio-btn-danger"
            onClick={() => {
              setConfirming(false);
              void remove().then(finish);
            }}
          >
            Confirm remove
          </button>
        ) : (
          <button type="button" className="studio-btn-ghost is-danger" onClick={() => setConfirming(true)}>
            Remove
          </button>
        )
      ) : null}
    </div>
  );
}

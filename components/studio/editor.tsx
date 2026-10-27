"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { prepareContentUpload } from "@/app/studio/(app)/media-actions";
import type { StudioState } from "@/lib/studio/form";
import { runUploads } from "@/lib/studio/upload-client";
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

/** Real percentage while the browser reports one, falling back to an indeterminate bar. */
export function UploadProgressBar({ percent, label }: { percent: number | null; label: string }) {
  return (
    <p className="studio-progress" role="status">
      <span
        className="studio-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={percent === null ? undefined : 0}
        aria-valuemax={percent === null ? undefined : 100}
        aria-valuenow={percent ?? undefined}
      >
        <span
          className={percent === null ? "studio-progress-bar is-waiting" : "studio-progress-bar"}
          style={percent === null ? undefined : { width: `${percent}%` }}
        />
      </span>
      <span className="studio-progress-label">{percent === null ? label : `${label} ${percent}%`}</span>
    </p>
  );
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
  const [percent, setPercent] = useState<number | null>(null);
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
    setPercent(null);
    try {
      const result = await runUploads(
        [{ file, prepare: () => prepareContentUpload(scope, ownerId, { type: file.type, size: file.size }), confirm }],
        "image",
        { onProgress: (progress) => setPercent(progress.percent) },
      );
      finish(
        result.errors.length > 0
          ? { error: result.errors[0] }
          : { ok: true, warning: result.warnings[0] },
      );
    } finally {
      setBusy(false);
      setPercent(null);
    }
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
      {busy ? <UploadProgressBar percent={percent} label={`Uploading ${label}`} /> : null}
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

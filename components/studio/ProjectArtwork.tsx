"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  confirmProjectUpload,
  prepareProjectUpload,
  removeGalleryImage,
  removeProjectImage,
  reorderGalleryImage,
  saveGalleryText,
  type DetailState,
} from "@/app/studio/(app)/projects/detail-actions";
import { maxImageLabel } from "@/lib/storage/validation";

type GalleryImage = {
  id: string;
  url: string;
  altText: string;
  caption: string | null;
};

export function ProjectArtwork({
  projectId,
  coverUrl,
  heroUrl,
  images,
}: {
  projectId: string;
  coverUrl: string | null;
  heroUrl: string | null;
  images: GalleryImage[];
}) {
  return (
    <div className="mt-8 grid max-w-2xl gap-8">
      <AssetSlot projectId={projectId} role="cover" label="Cover image" url={coverUrl} />
      <AssetSlot projectId={projectId} role="hero" label="Hero image" url={heroUrl} />
      <GalleryEditor projectId={projectId} images={images} />
    </div>
  );
}

function AssetSlot({
  projectId,
  role,
  label,
  url,
}: {
  projectId: string;
  role: "cover" | "hero";
  label: string;
  url: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<DetailState>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setStatus({});
    const ticket = await prepareProjectUpload(projectId, role, { type: file.type, size: file.size });
    if (!ticket.uploadUrl || !ticket.key || !ticket.contentType) {
      setStatus({ error: ticket.error ?? "Upload failed." });
      setBusy(false);
      return;
    }
    const response = await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": ticket.contentType },
      body: file,
    }).catch(() => null);
    if (!response?.ok) {
      setStatus({ error: "Upload failed." });
      setBusy(false);
      return;
    }
    const saved = await confirmProjectUpload(projectId, role, ticket.key);
    setStatus(saved.ok ? { ok: true, warning: saved.warning } : { error: saved.error ?? "Upload failed." });
    setBusy(false);
    if (saved.ok) router.refresh();
  }

  async function remove() {
    setBusy(true);
    const saved = await removeProjectImage(projectId, role);
    setStatus(saved.ok ? { ok: true, warning: saved.warning } : { error: saved.error ?? "The image could not be removed." });
    setConfirming(false);
    setBusy(false);
    if (saved.ok) router.refresh();
  }

  return (
    <section className="rounded-2xl bg-white p-4">
      <h3 className="text-sm font-semibold">{label}</h3>
      {url ? (
        <div className="relative mt-3 h-64 w-full">
          <Image src={url} alt="" fill className="object-contain" sizes="640px" />
        </div>
      ) : null}
      <Status state={status} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="rounded-full bg-[#2e211c] px-3 py-1.5 text-sm font-semibold text-[#f7f1ea]">
          {busy ? "Saving..." : url ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
          />
        </label>
        {url && !confirming ? (
          <button type="button" className="text-sm text-[#8a3b2b]" onClick={() => setConfirming(true)} disabled={busy}>
            Remove
          </button>
        ) : null}
        {confirming ? (
          <span className="flex items-center gap-2 text-sm">
            Remove this image?
            <button type="button" className="font-semibold text-[#8a3b2b]" onClick={() => void remove()} disabled={busy}>
              Remove
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </button>
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-[#1c120e]/55">JPEG, PNG, WebP, or AVIF. Up to {maxImageLabel}.</p>
    </section>
  );
}

function GalleryEditor({ projectId, images }: { projectId: string; images: GalleryImage[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<DetailState>({});
  const [busy, setBusy] = useState(false);

  async function upload(files: File[]) {
    setBusy(true);
    setStatus({});
    for (const file of files) {
      const ticket = await prepareProjectUpload(projectId, "gallery", { type: file.type, size: file.size });
      if (!ticket.uploadUrl || !ticket.key || !ticket.contentType) {
        setStatus({ error: ticket.error ?? "Upload failed." });
        setBusy(false);
        return;
      }
      const response = await fetch(ticket.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": ticket.contentType },
        body: file,
      }).catch(() => null);
      if (!response?.ok) {
        setStatus({ error: "Upload failed." });
        setBusy(false);
        return;
      }
      const saved = await confirmProjectUpload(projectId, "gallery", ticket.key);
      if (!saved.ok) {
        setStatus({ error: saved.error ?? "Upload failed." });
        setBusy(false);
        return;
      }
    }
    setStatus({ ok: true });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="rounded-2xl bg-white p-4">
      <h3 className="text-sm font-semibold">Gallery</h3>
      <p className="mt-2 text-xs text-[#1c120e]/55">
        Add alt text unless the image is decorative. JPEG, PNG, WebP, or AVIF. Up to {maxImageLabel} each.
      </p>
      <Status state={status} />
      <label className="mt-3 inline-flex rounded-full bg-[#2e211c] px-3 py-1.5 text-sm font-semibold text-[#f7f1ea]">
        {busy ? "Saving..." : "Upload images"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = "";
            if (files.length > 0) void upload(files);
          }}
        />
      </label>
      <ul className="mt-4 grid gap-4">
        {images.map((image, index) => (
          <li key={image.id} className="rounded-xl border border-[#1c120e]/10 p-3">
            <div className="relative h-48 w-full">
              <Image src={image.url} alt={image.altText} fill className="object-contain" sizes="640px" />
            </div>
            <GalleryTextForm image={image} />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="text-sm" disabled={busy || index === 0} onClick={() => void reorder(image.id, "up", setStatus, setBusy, router)}>
                Move up
              </button>
              <button
                type="button"
                className="text-sm"
                disabled={busy || index === images.length - 1}
                onClick={() => void reorder(image.id, "down", setStatus, setBusy, router)}
              >
                Move down
              </button>
              <RemoveGalleryButton imageId={image.id} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function reorder(
  imageId: string,
  direction: "up" | "down",
  setStatus: (state: DetailState) => void,
  setBusy: (busy: boolean) => void,
  router: { refresh: () => void },
) {
  setBusy(true);
  const saved = await reorderGalleryImage(imageId, direction);
  setStatus(saved.ok ? { ok: true } : { error: saved.error ?? "The gallery could not be reordered." });
  setBusy(false);
  if (saved.ok) router.refresh();
}

function GalleryTextForm({ image }: { image: GalleryImage }) {
  const [state, action] = useActionState(saveGalleryText, {});
  return (
    <form action={action} className="mt-3 grid gap-2">
      <input type="hidden" name="imageId" value={image.id} />
      <label className="grid gap-1 text-sm">
        Alt text
        <input name="altText" defaultValue={image.altText} className={controlClass} placeholder="Describe this image" />
      </label>
      <label className="grid gap-1 text-sm">
        Caption
        <input name="caption" defaultValue={image.caption ?? ""} className={controlClass} placeholder="Optional" />
      </label>
      <Status state={state} />
      <SaveButton label="Save text" />
    </form>
  );
}

function RemoveGalleryButton({ imageId }: { imageId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(removeGalleryImage, {});
  if (!open) {
    return (
      <button type="button" className="text-sm text-[#8a3b2b]" onClick={() => setOpen(true)}>
        Remove
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 text-sm">
      <input type="hidden" name="imageId" value={imageId} />
      <input type="hidden" name="confirm" value="delete" />
      <span>Remove this image?</span>
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
  if (state.warning) return <p className="text-sm text-[#8a3b2b]">{state.warning}</p>;
  if (state.ok) return <p className="text-sm text-[#2e211c]">Saved.</p>;
  return null;
}

const controlClass =
  "w-full rounded-lg border border-[#1c120e]/15 bg-white px-3 py-2 text-sm";

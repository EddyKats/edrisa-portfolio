"use client";

import { useActionState, useEffect, useState, type DragEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  FileImage,
  Film,
  GalleryVertical,
  GripVertical,
  Image as ImageIcon,
  ImageUp,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  confirmProjectUpload,
  prepareProjectUpload,
  removeGalleryImage,
  removeProjectImage,
  saveGalleryText,
  setPresentationOrder,
  type DetailState,
} from "@/app/studio/(app)/projects/detail-actions";
import { boardWidthMismatch, maxGifLabel, maxImageLabel, maxVideoLabel, naturalFileNameCompare } from "@/lib/storage/validation";

type PresentationItem = {
  id: string;
  url: string;
  altText: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  kind: "IMAGE" | "GIF" | "VIDEO";
  mimeType: string | null;
  originalName: string | null;
};

const accept = "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm";
const controlClass =
  "w-full min-w-0 rounded-xl border border-[#ececf6] bg-white px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4dff]";

export function ProjectArtwork({
  projectId,
  coverUrl,
  coverWidth,
  coverHeight,
  images,
}: {
  projectId: string;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  images: PresentationItem[];
}) {
  return (
    <div className="grid gap-8">
      <AssetSlot projectId={projectId} url={coverUrl} width={coverWidth} height={coverHeight} />
      <PresentationEditor projectId={projectId} images={images} />
    </div>
  );
}

function AssetSlot({
  projectId,
  url,
  width,
  height,
}: {
  projectId: string;
  url: string | null;
  width: number | null;
  height: number | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<DetailState>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [fileLabel, setFileLabel] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setFileLabel(file.name);
    setStatus({});
    const ticket = await prepareProjectUpload(projectId, "cover", { type: file.type, size: file.size });
    if (!ticket.uploadUrl || !ticket.key || !ticket.contentType) {
      setStatus({ error: uploadFailure(file, ticket.error ?? "Upload failed.") });
      setBusy(false);
      setFileLabel(null);
      return;
    }
    const response = await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": ticket.contentType },
      body: file,
    }).catch(() => null);
    if (!response?.ok) {
      setStatus({ error: uploadFailure(file, "The file could not be sent.") });
      setBusy(false);
      setFileLabel(null);
      return;
    }
    const saved = await confirmProjectUpload(projectId, "cover", ticket.key, file.name);
    setStatus(saved.ok ? { ok: true, warning: saved.warning } : { error: uploadFailure(file, saved.error ?? "Upload failed.") });
    setBusy(false);
    setFileLabel(null);
    if (saved.ok) router.refresh();
  }

  async function remove() {
    setBusy(true);
    const saved = await removeProjectImage(projectId, "cover");
    setStatus(saved.ok ? { ok: true, warning: saved.warning } : { error: saved.error ?? "The image could not be removed." });
    setConfirming(false);
    setBusy(false);
    if (saved.ok) router.refresh();
  }

  function takeFiles(event: DragEvent<HTMLElement>) {
    const files = [...event.dataTransfer.files];
    if (files.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const file = files[0];
    if (file) void upload(file);
  }

  return (
    <section id="cover" className="studio-card studio-panel scroll-mt-44">
      <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <ImageIcon className="size-5 text-[#1c120e]/55" aria-hidden="true" />
        Selected Works cover
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1c120e]/65">
        Shown on the Selected Works grid. This image is separate from the full project presentation.
      </p>
      <Status state={status} />
      {url ? (
        <div className="mt-6">
          <div className="studio-media-preview h-72">
            <Image src={url} alt="" fill className="object-contain" sizes="(min-width: 1024px) 960px, 100vw" />
          </div>
          {width && height ? <p className="mt-3 text-sm text-[#1c120e]/60">{width} × {height}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="studio-btn-primary cursor-pointer">
              <ImageUp className="size-4" aria-hidden="true" />
              {busy ? "Uploading..." : "Replace"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                disabled={busy}
                aria-label="Replace cover"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void upload(file);
                }}
              />
            </label>
            {confirming ? (
              <span className="flex flex-wrap items-center gap-2 text-sm">
                Remove this cover?
                <button type="button" className="font-semibold text-[#8a3b2b]" onClick={() => void remove()} disabled={busy}>
                  Remove
                </button>
                <button type="button" onClick={() => setConfirming(false)} disabled={busy}>
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="studio-btn-ghost is-danger"
                onClick={() => setConfirming(true)}
                disabled={busy}
                aria-label="Remove cover"
                title="Remove cover"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm font-medium">No cover image yet.</p>
          <label
            className={`studio-upload mt-3 ${over ? "is-on" : ""}`}
            onDragOver={(event) => {
              if (![...event.dataTransfer.types].includes("Files")) return;
              event.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(event) => {
              setOver(false);
              takeFiles(event);
            }}
          >
            <ImageIcon className="size-8 text-[#2e211c]/70" aria-hidden="true" />
            <span className="mt-4 text-lg font-semibold tracking-tight">{busy ? `Uploading ${fileLabel ?? "cover"}...` : "Drop cover image here"}</span>
            <span className="mt-2 text-sm font-semibold text-[#2e211c] underline underline-offset-4">Choose image</span>
            <span className="mt-4 text-xs tracking-wide text-[#1c120e]/55 uppercase">JPG, PNG, WebP or AVIF</span>
            <span className="mt-1 text-xs text-[#1c120e]/45">Up to {maxImageLabel}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              disabled={busy}
              aria-label="Choose cover image"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
            />
          </label>
        </div>
      )}
    </section>
  );
}

function PresentationEditor({ projectId, images }: { projectId: string; images: PresentationItem[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<DetailState>({});
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const reference = images.find((item) => item.kind !== "VIDEO" && item.width)?.width ?? null;
  const mismatched = images.filter((item) => item.kind !== "VIDEO" && boardWidthMismatch(reference, item.width)).length;
  const counts = {
    images: images.filter((item) => item.kind === "IMAGE").length,
    gifs: images.filter((item) => item.kind === "GIF").length,
    videos: images.filter((item) => item.kind === "VIDEO").length,
  };
  const breakdown = [
    counts.images ? `${counts.images} ${counts.images === 1 ? "Image" : "Images"}` : null,
    counts.gifs ? `${counts.gifs} GIF` : null,
    counts.videos ? `${counts.videos} ${counts.videos === 1 ? "Video" : "Videos"}` : null,
  ].filter(Boolean);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function upload(files: File[]) {
    const ordered = files.slice().sort((a, b) => naturalFileNameCompare(a.name, b.name));
    setBusy(true);
    setStatus({});
    for (const [index, file] of ordered.entries()) {
      setProgress(ordered.length > 1 ? `Uploading ${index + 1} of ${ordered.length} · ${file.name}` : `Uploading ${file.name}`);
      const ticket = await prepareProjectUpload(projectId, "presentation", { type: file.type, size: file.size });
      if (!ticket.uploadUrl || !ticket.key || !ticket.contentType) {
        setStatus({ error: uploadFailure(file, ticket.error ?? "Upload failed.") });
        setBusy(false);
        setProgress(null);
        return;
      }
      const response = await fetch(ticket.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": ticket.contentType },
        body: file,
      }).catch(() => null);
      if (!response?.ok) {
        setStatus({ error: uploadFailure(file, "The file could not be sent.") });
        setBusy(false);
        setProgress(null);
        return;
      }
      const saved = await confirmProjectUpload(projectId, "presentation", ticket.key, file.name);
      if (!saved.ok) {
        setStatus({ error: uploadFailure(file, saved.error ?? "Upload failed.") });
        setBusy(false);
        setProgress(null);
        return;
      }
    }
    setStatus({ ok: true });
    setNotice("Saved");
    setBusy(false);
    setProgress(null);
    router.refresh();
  }

  async function saveOrder(orderedIds: string[]) {
    setBusy(true);
    const saved = await setPresentationOrder(projectId, orderedIds);
    setStatus(saved.ok ? { ok: true } : { error: saved.error ?? "The presentation could not be reordered." });
    setNotice(saved.ok ? "Order saved" : null);
    setBusy(false);
    if (saved.ok) router.refresh();
  }

  function moveItem(imageId: string, direction: "up" | "down") {
    const ids = images.map((item) => item.id);
    const index = ids.indexOf(imageId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= ids.length) return;
    const next = ids.slice();
    const current = next[index];
    next[index] = next[target]!;
    next[target] = current!;
    void saveOrder(next);
  }

  return (
    <section
      id="presentation"
      className="studio-card studio-panel scroll-mt-44"
      onDragOver={(event) => {
        if (![...event.dataTransfer.types].includes("Files")) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        const files = [...event.dataTransfer.files];
        if (files.length === 0) return;
        event.preventDefault();
        setOver(false);
        void upload(files);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <GalleryVertical className="size-6 text-[#1c120e]/55" aria-hidden="true" />
            Project presentation
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1c120e]/65">
            Upload your presentation boards in display order. Use one consistent source width for a seamless scroll.
          </p>
          <p className="mt-1 text-sm text-[#1c120e]/55">2800px wide is recommended for projects shared between Edrisa and Behance.</p>
        </div>
        <p className="text-sm">
          <span className="font-semibold">{images.length} {images.length === 1 ? "item" : "items"}</span>
          {breakdown.length > 0 ? <span className="mt-1 block text-[#1c120e]/55">{breakdown.join(" · ")}</span> : null}
        </p>
      </div>
      {images.length > 0 ? (
        <p className={`mt-4 text-sm ${mismatched > 0 ? "text-[#8a3b2b]" : "text-[#1c120e]/70"}`}>
          {mismatched > 0
            ? `${mismatched} ${mismatched === 1 ? "board uses" : "boards use"} a different width`
            : "Board widths consistent"}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-3 text-sm text-[#2e211c]" role="status">
          {notice}
        </p>
      ) : null}
      <Status state={notice ? {} : status} />
      {images.length === 0 ? <p className="mt-6 text-base font-medium">No presentation boards yet.</p> : null}
      <label className={`studio-upload mt-6 ${over ? "is-on" : ""}`}>
        <UploadCloud className="size-10 text-[#2e211c]/75" aria-hidden="true" />
        <span className="mt-4 text-xl font-semibold tracking-tight">{progress ?? "Drop presentation media here"}</span>
        <span className="mt-2 text-sm font-semibold text-[#2e211c] underline underline-offset-4">or choose files</span>
        <span className="mt-5 text-xs tracking-[0.12em] text-[#1c120e]/60 uppercase">JPG · PNG · WebP · AVIF · GIF</span>
        <span className="mt-1 text-xs tracking-[0.12em] text-[#1c120e]/60 uppercase">MP4 · WebM</span>
        <span className="mt-3 text-xs text-[#1c120e]/45">
          Images up to {maxImageLabel}. GIFs up to {maxGifLabel}. Video up to {maxVideoLabel}.
        </span>
        {progress ? (
          <span className="mt-4 block h-1 w-40 overflow-hidden rounded-full bg-[#1c120e]/10" role="progressbar" aria-label={progress}>
            <span className="block h-full w-full animate-pulse bg-[#2e211c]/70" />
          </span>
        ) : null}
        <input
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          disabled={busy}
          aria-label="Choose presentation files"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = "";
            if (files.length > 0) void upload(files);
          }}
        />
      </label>
      <ul className="mt-6 grid gap-4">
        {images.map((image, index) => {
          const from = dragId ? images.findIndex((item) => item.id === dragId) : -1;
          const placeAfter = from >= 0 && from < index;
          return (
            <li
              key={image.id}
              className={`relative min-w-0 rounded-2xl border border-[#1c120e]/10 bg-[#fffdfb] p-3 sm:p-4 ${dragId === image.id ? "opacity-50" : ""}`}
              onDragOver={(event) => {
                if (!dragId) return;
                event.preventDefault();
                setOverId(image.id);
              }}
              onDragLeave={() => {
                setOverId((current) => (current === image.id ? null : current));
              }}
              onDrop={(event) => {
                setOverId(null);
                if (event.dataTransfer.files.length > 0 || !dragId || dragId === image.id) return;
                event.preventDefault();
                event.stopPropagation();
                const ids = images.map((item) => item.id);
                const source = ids.indexOf(dragId);
                if (source < 0) return;
                const next = ids.slice();
                const [moved] = next.splice(source, 1);
                next.splice(index, 0, moved!);
                setDragId(null);
                void saveOrder(next);
              }}
            >
              {overId === image.id && dragId !== image.id ? (
                <span
                  className={`pointer-events-none absolute inset-x-3 h-0.5 rounded-full bg-[#2e211c] ${placeAfter ? "bottom-0" : "top-0"}`}
                  aria-hidden="true"
                />
              ) : null}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-2 sm:flex-col sm:items-center">
                  <button
                    type="button"
                    draggable={!busy}
                    aria-label="Drag to reorder"
                    title="Drag to reorder"
                    className={`grid size-10 place-items-center rounded-lg text-[#1c120e]/55 hover:bg-black/5 hover:text-[#1c120e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c] ${
                      dragId === image.id ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    onDragStart={(event) => {
                      setDragId(image.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", image.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                  >
                    <GripVertical className="size-5" aria-hidden="true" />
                  </button>
                  <span className="text-sm font-semibold text-[#1c120e]/45 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <Preview item={image} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold break-words">{image.originalName || fileName(image.url)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <KindBadge kind={image.kind} />
                    {image.width && image.height ? <span className="text-xs text-[#1c120e]/55">{image.width} × {image.height}</span> : null}
                  </div>
                  {image.kind !== "VIDEO" && boardWidthMismatch(reference, image.width) ? (
                    <p className="mt-2 text-xs text-[#8a3b2b]">Different board width. This may break the seamless presentation.</p>
                  ) : null}
                  <GalleryTextForm image={image} />
                </div>
                <div className="flex items-center gap-1 sm:flex-col">
                  <IconButton label="Move up" disabled={busy || index === 0} onClick={() => moveItem(image.id, "up")}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Move down" disabled={busy || index === images.length - 1} onClick={() => moveItem(image.id, "down")}>
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </IconButton>
                  <span className="mx-1 hidden h-6 w-px bg-[#1c120e]/10 sm:mx-0 sm:my-1 sm:h-px sm:w-6" aria-hidden="true" />
                  <RemoveGalleryButton imageId={image.id} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Preview({ item }: { item: PresentationItem }) {
  if (item.kind === "VIDEO") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        className="h-36 w-full rounded-lg bg-[#1c120e]/5 sm:w-44"
        aria-label={item.altText || item.originalName || "Video preview"}
      >
        <source src={item.url} type={item.mimeType ?? undefined} />
      </video>
    );
  }
  if (item.kind === "GIF") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.url} alt={item.altText} className="h-36 w-full rounded-lg bg-[#f7f1ea] object-contain sm:w-44" />
    );
  }
  return (
    <div className="relative h-36 w-full overflow-hidden rounded-lg bg-[#f7f1ea] sm:w-44">
      <Image src={item.url} alt={item.altText} fill className="object-contain" sizes="176px" />
    </div>
  );
}

function KindBadge({ kind }: { kind: PresentationItem["kind"] }) {
  const Icon = kind === "VIDEO" ? Film : kind === "GIF" ? FileImage : ImageIcon;
  const label = kind === "VIDEO" ? "VIDEO" : kind === "GIF" ? "GIF" : "IMAGE";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#1c120e]/8 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.14em] text-[#1c120e]">
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full text-[#1c120e] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function GalleryTextForm({ image }: { image: PresentationItem }) {
  const [state, action] = useActionState(saveGalleryText, {});
  return (
    <form action={action} className="mt-4 grid gap-2">
      <input type="hidden" name="imageId" value={image.id} />
      <label className="grid gap-1 text-sm font-medium">
        <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-[#1c120e]/45 uppercase">Alt text</span>
        <input name="altText" defaultValue={image.altText} className={controlClass} placeholder="Stadium campaign presentation board" />
        <span className="font-normal text-[#1c120e]/50">Describe the visual for accessibility.</span>
      </label>
      <details className="text-sm">
        <summary className="flex cursor-pointer items-center gap-1 text-[#1c120e]/60">
          <ChevronDown className="size-3.5" aria-hidden="true" />
          More options
        </summary>
        <label className="mt-2 grid gap-1">
          Caption
          <input name="caption" defaultValue={image.caption ?? ""} className={controlClass} placeholder="Stored only, not shown publicly" />
        </label>
      </details>
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
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full text-[#8a3b2b] hover:bg-[#8a3b2b]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a3b2b]"
        onClick={() => setOpen(true)}
        aria-label="Remove presentation item"
        title="Remove presentation item"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 text-sm sm:w-40">
      <input type="hidden" name="imageId" value={imageId} />
      <input type="hidden" name="confirm" value="delete" />
      <span>Remove this board?</span>
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
    <button
      type="submit"
      disabled={pending}
      className="studio-btn-primary"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function Status({ state }: { state: DetailState }) {
  if (state.error) {
    return (
      <p className="mt-3 text-sm text-[#8a3b2b]" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.warning) return <p className="mt-3 text-sm text-[#8a3b2b]">{state.warning}</p>;
  if (state.ok) return <p className="mt-3 text-sm text-[#2e211c]">Saved.</p>;
  return null;
}

function uploadFailure(file: File, message: string) {
  const detail = message.replace(/^upload failed\.?\s*/i, "").trim();
  return detail ? `${file.name}: Upload failed. ${detail}` : `${file.name}: Upload failed.`;
}

function fileName(url: string) {
  const name = url.split("/").pop()?.split("?")[0];
  return name || "Untitled board";
}

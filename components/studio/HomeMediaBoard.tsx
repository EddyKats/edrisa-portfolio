"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OrderButtons, Status, UploadProgressBar, controlClass } from "@/components/studio/editor";
import { runUploads } from "@/lib/studio/upload-client";
import { prepareContentUpload } from "@/app/studio/(app)/media-actions";
import {
  confirmAddHomeMedia,
  confirmHomeMediaItem,
  removeHomePicture,
  reorderHomePicture,
  saveHomeMode,
} from "@/app/studio/(app)/home/actions";
import { modeField, type HomeMediaMode, type HomeSurface } from "@/lib/content/home-surfaces";
import type { StudioState } from "@/lib/studio/form";

const accept = "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm";

const sections: { surface: HomeSurface; title: string; note: string }[] = [
  { surface: "hero", title: "Hero portrait", note: "Fills the left homepage panel. Video loops muted." },
  { surface: "about", title: "About tile", note: "Sits over the About gradient when a file is set." },
  { surface: "services", title: "Services tile", note: "Sits over the Services gradient when a file is set." },
  { surface: "contact", title: "Contact tile", note: "Sits over the Contact gradient when a file is set." },
  { surface: "portfolio", title: "Portfolio tile", note: "Sits over the Portfolio gradient when a file is set." },
];

type MediaItem = { id: string; imageUrl: string; kind: string; surface: string };

export function HomeMediaBoard({
  home,
}: {
  home: {
    portraitMode: string;
    aboutMode: string;
    servicesMode: string;
    contactMode: string;
    portfolioMode: string;
    portraits: MediaItem[];
  };
}) {
  return (
    <div className="studio-stack">
      {sections.map((section) => {
        const mode = (home[modeField(section.surface)] === "sequence" ? "sequence" : "single") as HomeMediaMode;
        const items = home.portraits.filter((item) => item.surface === section.surface);
        return <SectionBoard key={section.surface} {...section} mode={mode} items={items} />;
      })}
    </div>
  );
}

function SectionBoard({
  surface,
  title,
  note,
  mode,
  items,
}: {
  surface: HomeSurface;
  title: string;
  note: string;
  mode: HomeMediaMode;
  items: MediaItem[];
}) {
  const router = useRouter();
  const [state, action] = useActionState(saveHomeMode, {});
  const [selected, setSelected] = useState(mode);
  const shown = selected === "sequence" ? items : items.slice(0, 1);

  useEffect(() => {
    setSelected(mode);
  }, [mode]);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [router, state]);

  return (
    <div className="studio-stack">
      <form action={action} className="studio-card studio-form">
        <h2>{title}</h2>
        <p className="studio-help">{note} Single keeps one file. Changing pictures lets you add more and fade through them on the live homepage.</p>
        <Status state={state} />
        <input type="hidden" name="surface" value={surface} />
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">{title} display</legend>
          <label className={`studio-choice${selected === "single" ? " is-on" : ""}`}>
            <input
              type="radio"
              name="mode"
              value="single"
              checked={selected === "single"}
              onChange={() => setSelected("single")}
              className="sr-only"
            />
            Single display
          </label>
          <label className={`studio-choice${selected === "sequence" ? " is-on" : ""}`}>
            <input
              type="radio"
              name="mode"
              value="sequence"
              checked={selected === "sequence"}
              onChange={() => setSelected("sequence")}
              className="sr-only"
            />
            Changing pictures
          </label>
        </fieldset>
        <button type="submit" className="studio-btn-primary">
          Save display
        </button>
      </form>

      {shown.map((item) => (
        <div key={item.id} className="studio-stack">
          {selected === "sequence" ? (
            <div className="flex justify-end">
              <OrderButtons action={(direction) => reorderHomePicture(item.id, direction)} />
            </div>
          ) : null}
          <MediaSlot
            label={selected === "single" ? "Change picture" : kindLabel(item.kind)}
            url={item.imageUrl}
            kind={item.kind}
            ownerId={item.id}
            confirm={(key) => confirmHomeMediaItem(item.id, key)}
            remove={selected === "sequence" ? () => removeHomePicture(item.id) : undefined}
          />
        </div>
      ))}

      {selected === "single" && items.length === 0 ? (
        <AddMedia surface={surface} title="Picture" />
      ) : null}
      {selected === "sequence" ? <AddMedia surface={surface} title="Add a picture or video" /> : null}
    </div>
  );
}

function MediaSlot({
  label,
  url,
  kind,
  ownerId,
  confirm,
  remove,
}: {
  label: string;
  url: string;
  kind: string;
  ownerId: string;
  confirm: (key: string) => Promise<StudioState>;
  remove?: () => Promise<StudioState>;
}) {
  const router = useRouter();
  const [state, setState] = useState<StudioState>({});
  const [busy, setBusy] = useState(false);
  const [percent, setPercent] = useState<number | null>(null);

  return (
    <div className="studio-card studio-form">
      <h2>{label}</h2>
      <Status state={state} />
      {kind === "VIDEO" ? (
        <video src={url} muted playsInline controls className="mb-3 w-full rounded-xl bg-black" />
      ) : (
        <Image src={url} alt="" width={720} height={900} unoptimized={kind === "GIF"} className="mb-3 h-auto w-full rounded-xl" />
      )}
      <label className="studio-file">
        JPEG, PNG, WebP, AVIF, GIF, MP4, or WebM
        <input
          type="file"
          accept={accept}
          disabled={busy}
          className={controlClass}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void runUpload(file, ownerId, confirm, setBusy, setState, router, setPercent);
          }}
        />
      </label>
      {busy ? <UploadProgressBar percent={percent} label="Uploading" /> : null}
      {remove ? (
      <button
        type="button"
        className="studio-btn-danger"
        disabled={busy}
        onClick={() => {
          void (async () => {
            setBusy(true);
            const next = await remove();
            setState(next);
            if (next.ok) router.refresh();
            setBusy(false);
          })();
        }}
      >
        Remove
      </button>
      ) : null}
    </div>
  );
}

function AddMedia({ surface, title }: { surface: HomeSurface; title: string }) {
  const router = useRouter();
  const [state, setState] = useState<StudioState>({});
  const [busy, setBusy] = useState(false);
  const [percent, setPercent] = useState<number | null>(null);

  return (
    <div className="studio-card studio-form">
      <h2>{title}</h2>
      <Status state={state} />
      <label className="studio-file">
        JPEG, PNG, WebP, AVIF, GIF, MP4, or WebM
        <input
          type="file"
          accept={accept}
          disabled={busy}
          className={controlClass}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void (async () => {
              const ownerId = crypto.randomUUID();
              await runUpload(
                file,
                ownerId,
                (key) => confirmAddHomeMedia(surface, ownerId, key),
                setBusy,
                setState,
                router,
                setPercent,
              );
            })();
          }}
        />
      </label>
      {busy ? <UploadProgressBar percent={percent} label="Uploading" /> : null}
    </div>
  );
}

async function runUpload(
  file: File,
  ownerId: string,
  confirm: (key: string) => Promise<StudioState>,
  setBusy: (value: boolean) => void,
  setState: (value: StudioState) => void,
  router: ReturnType<typeof useRouter>,
  setPercent: (value: number | null) => void,
) {
  setBusy(true);
  setState({});
  setPercent(null);
  try {
    const result = await runUploads(
      [
        {
          file,
          prepare: () => prepareContentUpload("home-media", ownerId, { type: file.type, size: file.size }),
          confirm: (key) => confirm(key),
        },
      ],
      "media",
      { onProgress: (progress) => setPercent(progress.percent) },
    );
    setState(result.errors.length > 0 ? { error: result.errors[0] } : { ok: true, warning: result.warnings[0] });
    // revalidateProjectContent does not cover the studio pages, so this refresh is
    // what actually shows the new file.
    if (result.errors.length === 0) router.refresh();
  } finally {
    setBusy(false);
    setPercent(null);
  }
}

function kindLabel(kind: string) {
  if (kind === "VIDEO") return "Video";
  if (kind === "GIF") return "GIF";
  return "Picture";
}

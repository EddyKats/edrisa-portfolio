"use client";

import { useActionState, useEffect, useState } from "react";
import { ImageField, OrderButtons, Status, controlClass } from "@/components/studio/editor";
import { prepareContentUpload } from "@/app/studio/(app)/media-actions";
import {
  confirmAddHomePortrait,
  confirmHomeGalleryPortrait,
  confirmHomePortrait,
  removeHomePicture,
  reorderHomePicture,
  saveHomeMode,
} from "@/app/studio/(app)/home/actions";
import type { StudioState } from "@/lib/studio/form";
import { useRouter } from "next/navigation";

export function HomePortraits({
  mode,
  portraitUrl,
  portraits,
}: {
  mode: "single" | "sequence";
  portraitUrl: string | null;
  portraits: { id: string; imageUrl: string }[];
}) {
  const router = useRouter();
  const [state, action] = useActionState(saveHomeMode, {});
  const [selected, setSelected] = useState(mode);

  useEffect(() => {
    setSelected(mode);
  }, [mode]);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [router, state]);

  return (
    <div className="studio-stack">
      <form action={action} className="studio-card studio-form">
        <h2>Portrait</h2>
        <p className="studio-help">
          Single keeps one still. Changing pictures fades through the set on the public homepage.
        </p>
        <Status state={state} />
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">Portrait display</legend>
          <label className={`studio-choice${selected === "single" ? " is-on" : ""}`}>
            <input
              type="radio"
              name="portraitMode"
              value="single"
              checked={selected === "single"}
              onChange={() => setSelected("single")}
              className="sr-only"
            />
            Single portrait
          </label>
          <label className={`studio-choice${selected === "sequence" ? " is-on" : ""}`}>
            <input
              type="radio"
              name="portraitMode"
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

      {mode === "single" ? (
        <ImageField
          label="Portrait"
          url={portraitUrl}
          scope="home-portrait"
          ownerId="home"
          confirm={confirmHomePortrait}
        />
      ) : (
        <div className="studio-stack">
          {portraits.map((item) => (
            <div key={item.id} className="studio-stack">
              <div className="flex justify-end">
                <OrderButtons action={(direction) => reorderHomePicture(item.id, direction)} />
              </div>
              <ImageField
                label="Picture"
                url={item.imageUrl}
                scope="home-portrait"
                ownerId={item.id}
                confirm={(key) => confirmHomeGalleryPortrait(item.id, key)}
                remove={() => removeHomePicture(item.id)}
              />
            </div>
          ))}
          <AddPicture />
        </div>
      )}
    </div>
  );
}

function AddPicture() {
  const router = useRouter();
  const [state, setState] = useState<StudioState>({});
  const [busy, setBusy] = useState(false);

  return (
    <div className="studio-card studio-form">
      <h2>Add a picture</h2>
      <Status state={state} />
      <label className="studio-file">
        JPEG, PNG, WebP, or AVIF
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy}
          className={controlClass}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void (async () => {
              setBusy(true);
              setState({});
              const ownerId = crypto.randomUUID();
              const ticket = await prepareContentUpload("home-portrait", ownerId, { type: file.type, size: file.size });
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
              const next = await confirmAddHomePortrait(ownerId, ticket.key);
              setState(next);
              if (next.ok) router.refresh();
              setBusy(false);
            })();
          }}
        />
      </label>
    </div>
  );
}

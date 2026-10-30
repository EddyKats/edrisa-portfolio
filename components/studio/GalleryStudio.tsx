"use client";

import { useActionState } from "react";
import {
  confirmGalleryImage,
  removeGalleryImage,
  removeGalleryPhoto,
  reorderGalleryPhoto,
  saveGalleryRecord,
} from "@/app/studio/(app)/gallery/actions";
import { ImageField, OrderButtons, PublishBadge, SaveButton, Status, controlClass } from "@/components/studio/editor";

type PhotoRow = {
  id: string;
  title: string;
  altText: string;
  caption: string;
  category: string;
  imageUrl: string | null;
  published: boolean;
};

export function GalleryStudio({ photos }: { photos: PhotoRow[] }) {
  return (
    <div className="studio-stack">
      {photos.length === 0 ? <p className="studio-empty">No photographs yet. Add one, then upload the image.</p> : null}
      {photos.map((photo) => (
        <PhotoForm key={photo.id} photo={photo} />
      ))}
      <PhotoForm />
    </div>
  );
}

function PhotoForm({ photo }: { photo?: PhotoRow }) {
  const [state, action] = useActionState(saveGalleryRecord, {});
  const [removeState, removeAction] = useActionState(removeGalleryPhoto, {});

  return (
    <div className="studio-card studio-form">
      <div className="flex items-center justify-between">
        {photo ? <PublishBadge published={photo.published} /> : <p>New photograph</p>}
        {photo ? <OrderButtons action={(direction) => reorderGalleryPhoto(photo.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {photo ? <input type="hidden" name="id" value={photo.id} /> : null}
        <Status state={state} />
        <label>
          Title
          <input name="title" defaultValue={photo?.title ?? ""} className={controlClass} />
        </label>
        <label>
          Alt text
          <input name="altText" defaultValue={photo?.altText ?? ""} className={controlClass} />
        </label>
        <label>
          Caption
          <textarea name="caption" defaultValue={photo?.caption ?? ""} rows={3} className={controlClass} />
        </label>
        <label>
          Category
          <input name="category" defaultValue={photo?.category ?? ""} placeholder="Optional" className={controlClass} />
        </label>
        <label className="studio-check">
          <input type="checkbox" name="published" defaultChecked={photo?.published ?? false} />
          Published
        </label>
        <SaveButton label={photo ? "Save photograph" : "Add photograph"} />
      </form>
      {photo ? (
        <>
          <ImageField
            label="Photograph"
            url={photo.imageUrl}
            scope="gallery"
            ownerId={photo.id}
            confirm={(key) => confirmGalleryImage(photo.id, key)}
            remove={() => removeGalleryImage(photo.id)}
          />
          <form action={removeAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={photo.id} />
            <Status state={removeState} />
            <input name="confirm" placeholder="Type delete" className={controlClass} />
            <SaveButton label="Delete" tone="danger" />
          </form>
        </>
      ) : null}
    </div>
  );
}

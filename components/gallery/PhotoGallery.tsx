"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { RevealImage } from "@/components/media/RevealImage";

export type GalleryPhoto = {
  id: string;
  slug: string;
  title: string;
  alt: string;
  caption: string | null;
  category: string | null;
  src: string;
  width: number | null;
  height: number | null;
};

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = open === null ? null : photos[open];

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open === null) {
      if (node.open) node.close();
      return;
    }
    if (!node.open) node.showModal();
  }, [open]);

  function step(direction: -1 | 1) {
    setOpen((index) => {
      if (index === null || photos.length === 0) return index;
      return (index + direction + photos.length) % photos.length;
    });
  }

  return (
    <>
      <ul className="photo-grid">
        {photos.map((photo, index) => {
          const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 5";
          return (
            <li key={photo.id}>
              <figure id={photo.slug} className="photo-card">
                <a
                  href={photo.src}
                  aria-label={photo.alt}
                  className="photo-frame"
                  style={{ aspectRatio: ratio }}
                  onClick={(event) => {
                    event.preventDefault();
                    setOpen(index);
                  }}
                >
                  <RevealImage
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    priority={index < 3}
                    sizes="(min-width: 80rem) 33vw, (min-width: 40rem) 50vw, 100vw"
                    className="object-cover"
                  />
                </a>
                <figcaption className="mt-3">
                  {photo.category ? (
                    <p className="text-xs font-semibold tracking-[0.16em] text-ink/50 uppercase">{photo.category}</p>
                  ) : null}
                  <h2 className="mt-1 text-lg leading-tight font-semibold tracking-tight">{photo.title}</h2>
                  {photo.caption ? <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{photo.caption}</p> : null}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      <dialog ref={dialog} className="photo-lightbox" aria-label={current?.title ?? "Photograph"} onClose={() => setOpen(null)}>
        {current ? (
          <div className="photo-lightbox-panel">
            <div className="photo-lightbox-frame">
              <RevealImage
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain"
              />
            </div>
            <div className="photo-lightbox-bar">
              <div>
                <p className="text-base font-semibold">{current.title}</p>
                {current.caption ? <p className="mt-1 text-sm text-white/70">{current.caption}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="photo-lightbox-btn" aria-label="Previous photograph" onClick={() => step(-1)}>
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button type="button" className="photo-lightbox-btn" aria-label="Next photograph" onClick={() => step(1)}>
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
                <button type="button" className="photo-lightbox-btn" aria-label="Close photograph" onClick={() => dialog.current?.close()}>
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

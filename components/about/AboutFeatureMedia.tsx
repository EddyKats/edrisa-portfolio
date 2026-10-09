import Image from "next/image";
import { Play } from "lucide-react";
import { Watermark } from "@/components/site/Watermark";
import { aboutFeature } from "@/data/about";
import { getNavItem } from "@/data/navigation";

const aboutSurface = getNavItem("about").surfaceClass;

/**
 * The centered play mark is visual only.
 * Connect playback here when a showreel file exists.
 */
export function AboutFeatureMedia() {
  return (
    <figure className="mt-14 sm:mt-16">
      <div className="relative aspect-video overflow-hidden rounded-[12px]">
        {aboutFeature.src ? (
          <Image
            src={aboutFeature.src}
            alt={aboutFeature.alt}
            fill
            priority
            sizes="(min-width: 960px) 720px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className={`absolute inset-0 ${aboutSurface}`}>
            <Watermark />
            <span className="sr-only">
              Featured image placeholder. Add a photograph or showreel still later.
            </span>
          </div>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 text-white"
        >
          <Play className="size-5 translate-x-0.5" fill="currentColor" strokeWidth={1.5} />
        </span>
      </div>
    </figure>
  );
}

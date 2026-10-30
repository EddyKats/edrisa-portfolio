import type { Metadata } from "next";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { JsonLd } from "@/components/site/JsonLd";
import { getPublicCta } from "@/lib/content/cta";
import { listPublishedGallery } from "@/lib/content/gallery";
import { absoluteAsset, personId, studioId } from "@/lib/content/jsonld";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

const title = "Gallery · Kasibante Edrisa";
const description = "Photographs by Kasibante Edrisa of Edrisa Studio.";

export async function generateMetadata(): Promise<Metadata> {
  const photos = await listPublishedGallery();
  const first = photos[0];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/gallery" },
    openGraph: {
      title,
      description,
      url: "/gallery",
      ...(first ? { images: [{ url: first.src, alt: first.alt }] } : {}),
    },
  };
}

export default async function GalleryPage() {
  const [photos, site, cta] = await Promise.all([listPublishedGallery(), getPublicSite(), getPublicCta("portfolio")]);
  const origin = site.url.replace(/\/$/, "");

  return (
    <InternalPageLayout section="gallery">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          "@id": `${origin}/gallery#gallery`,
          url: `${origin}/gallery`,
          name: "Gallery",
          description,
          creator: { "@id": personId(origin) },
          publisher: { "@id": studioId(origin) },
          image: photos.map((photo) => ({
            "@type": "ImageObject",
            contentUrl: absoluteAsset(origin, photo.src),
            name: photo.title,
            caption: photo.caption || photo.title,
            description: photo.alt,
          })),
        }}
      />
      <div className="internal-frame px-5 pt-14 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-20">
        <InternalTitle>
          <span className="block">Gallery</span>
        </InternalTitle>
        <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-ink/70">
          Photographs of the work, and of the person behind Edrisa Studio.
        </p>
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} />
        ) : (
          <p className="mt-16 text-center text-base text-ink/60">Photographs will appear here once they are published.</p>
        )}
        <InternalCTA
          section="gallery"
          heading={cta?.heading ?? "Have a project in mind?"}
          body={cta?.body ?? "Bring the idea. I'll bring the attention to detail."}
          label={cta?.buttonLabel ?? "Talk to me"}
          href={cta?.buttonHref ?? "/contact"}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}

import { GalleryStudio } from "@/components/studio/GalleryStudio";
import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { listStudioGallery } from "@/lib/content/gallery";

export default async function StudioGalleryPage() {
  const photos = await listStudioGallery();

  return (
    <section>
      <StudioPageHead title="Gallery" note="Published photographs appear on the public gallery, in this order." />
      <GalleryStudio
        photos={photos.map((photo) => ({
          id: photo.id,
          title: photo.title,
          altText: photo.altText,
          caption: photo.caption ?? "",
          category: photo.category ?? "",
          imageUrl: photo.imageUrl,
          published: photo.published,
        }))}
      />
    </section>
  );
}

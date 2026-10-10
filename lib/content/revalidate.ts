import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Content edits go database → these paths → the next public read.
 * Public pages read Neon, so a studio save shows up without a new deployment.
 */
export function revalidateProjectContent(slugs: Array<string | null | undefined>) {
  revalidatePath("/portfolio");
  revalidatePath("/portfolio/[slug]", "page");
  revalidatePath("/studio/projects");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/portfolio/${slug}`);
  }
}

export function revalidatePublicContent(paths: string[]) {
  for (const path of paths) revalidatePath(path);
  revalidatePath("/portfolio/[slug]", "page");
}

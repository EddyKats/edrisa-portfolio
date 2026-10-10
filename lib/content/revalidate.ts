import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Content edits go database → these paths → the next public read.
 * Portfolio pages read Neon, so a studio save shows up without a new deployment.
 * Home, About, Services, and Contact still read the static files.
 */
export function revalidateProjectContent(slugs: Array<string | null | undefined>) {
  revalidatePath("/portfolio");
  revalidatePath("/studio/projects");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/portfolio/${slug}`);
  }
}

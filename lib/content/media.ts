import "server-only";

import { deletePortfolioAsset, storageKeyFromUrl } from "@/lib/storage";

export const storageWarning = "The record was updated, but the previous file could not be removed from storage.";

export async function removeStoredFile(url: string | null | undefined) {
  const key = storageKeyFromUrl(url);
  if (!key) return null;
  try {
    await deletePortfolioAsset(key);
    return null;
  } catch {
    return storageWarning;
  }
}

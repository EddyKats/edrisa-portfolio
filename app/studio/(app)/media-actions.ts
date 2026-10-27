"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { failure, type StudioState } from "@/lib/studio/form";
import { createContentUpload } from "@/lib/storage";
import { isContentAssetScope } from "@/lib/storage/validation";

export type { StudioState };

export type UploadTicket = {
  error?: string;
  uploadUrl?: string;
  key?: string;
  contentType?: string;
};

export async function prepareContentUpload(
  scope: string,
  ownerId: string,
  file: { type: string; size: number },
): Promise<UploadTicket> {
  await requireAdmin();
  if (!isContentAssetScope(scope)) return { error: "That upload could not be started." };
  try {
    const ticket = await createContentUpload({ scope, ownerId, type: file.type, size: file.size });
    if ("error" in ticket && ticket.error) return { error: ticket.error };
    if (!ticket.uploadUrl || !ticket.key) return { error: "Upload failed." };
    return { uploadUrl: ticket.uploadUrl, key: ticket.key, contentType: file.type };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}


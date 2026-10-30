"use client";

import { validateUploadKind, type UploadKind } from "@/lib/storage/validation";

export type { UploadKind };

export type UploadTicket = {
  error?: string;
  uploadUrl?: string;
  key?: string;
  contentType?: string;
  cacheControl?: string;
};

export type UploadOutcome = {
  error?: string;
  ok?: boolean;
  warning?: string;
};

export type UploadJob = {
  file: File;
  prepare: (file: File) => Promise<UploadTicket>;
  confirm: (key: string, file: File) => Promise<UploadOutcome>;
};

export type UploadProgress = {
  index: number;
  total: number;
  fileName: string;
  /** 0-100, or null while the browser has not reported a measurable length. */
  percent: number | null;
};

export type BatchResult = {
  uploaded: number;
  total: number;
  /** One per failed file, already prefixed with the file name. */
  errors: string[];
  warnings: string[];
  summary: string | null;
  cancelled: boolean;
};

/** Prefixes a message with the file it belongs to, so a batch failure names the culprit. */
export function uploadFailure(fileName: string, message: string) {
  const detail = message.replace(/^upload failed\.?\s*/i, "").trim();
  return detail ? `${fileName}: Upload failed. ${detail}` : `${fileName}: Upload failed.`;
}

/**
 * Rejects a file before it costs a round trip, using the same rules the server applies
 * so the message matches what the server would have said.
 */
export function preflight(file: File, kind: UploadKind) {
  return validateUploadKind(kind, { type: file.type, size: file.size });
}

/**
 * PUTs the file straight to storage. Uses XMLHttpRequest rather than fetch because only
 * XHR reports upload progress and can be aborted, which matters at the video size limit.
 * Never rejects: failures come back as a readable message.
 *
 * Do not transform the file between prepare and here. Content-Length is a signed header
 * on the presigned URL, so any change to the byte count is rejected as a bad signature.
 */
export function sendToStorage(
  uploadUrl: string,
  contentType: string,
  file: File,
  options: { cacheControl?: string; onProgress?: (percent: number | null) => void; signal?: AbortSignal } = {},
): Promise<{ ok: boolean; message?: string }> {
  return new Promise((resolve) => {
    if (options.signal?.aborted) {
      resolve({ ok: false, message: "Upload cancelled." });
      return;
    }

    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    const done = (result: { ok: boolean; message?: string }) => {
      options.signal?.removeEventListener("abort", abort);
      resolve(result);
    };

    request.open("PUT", uploadUrl, true);
    request.setRequestHeader("Content-Type", contentType);
    if (options.cacheControl) request.setRequestHeader("Cache-Control", options.cacheControl);

    request.upload.onprogress = (event) => {
      options.onProgress?.(event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : null);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        done({ ok: true });
        return;
      }
      done({ ok: false, message: storageErrorMessage(request.status, request.responseText) });
    };
    // status 0 means the request never completed: offline, blocked, or CORS.
    request.onerror = () => done({ ok: false, message: "The file could not be sent. Check your connection." });
    request.ontimeout = () => done({ ok: false, message: "The file could not be sent. The upload timed out." });
    request.onabort = () => done({ ok: false, message: "Upload cancelled." });

    options.signal?.addEventListener("abort", abort, { once: true });
    request.send(file);
  });
}

/**
 * Uploads each job in turn, continuing past failures so one bad file cannot block the
 * rest of a batch. Stays sequential on purpose: confirming records a sort order read
 * from the current maximum, so parallel confirms would race and collide.
 */
export async function runUploads(
  jobs: UploadJob[],
  kind: UploadKind,
  options: { onProgress?: (progress: UploadProgress) => void; signal?: AbortSignal } = {},
): Promise<BatchResult> {
  const total = jobs.length;
  const errors: string[] = [];
  const warnings: string[] = [];
  let uploaded = 0;
  let cancelled = false;

  for (const [index, job] of jobs.entries()) {
    if (options.signal?.aborted) {
      cancelled = true;
      break;
    }

    const name = job.file.name;
    const report = (percent: number | null) => options.onProgress?.({ index, total, fileName: name, percent });
    report(0);

    const rejected = preflight(job.file, kind);
    if (rejected) {
      errors.push(uploadFailure(name, rejected));
      continue;
    }

    const ticket = await job.prepare(job.file).catch(() => ({ error: "Upload failed." }) as UploadTicket);
    if (!ticket.uploadUrl || !ticket.key || !ticket.contentType) {
      errors.push(uploadFailure(name, ticket.error ?? "Upload failed."));
      continue;
    }

    const sent = await sendToStorage(ticket.uploadUrl, ticket.contentType, job.file, {
      cacheControl: ticket.cacheControl,
      onProgress: report,
      signal: options.signal,
    });
    if (!sent.ok) {
      if (options.signal?.aborted) {
        cancelled = true;
        break;
      }
      errors.push(uploadFailure(name, sent.message ?? "The file could not be sent."));
      continue;
    }

    const saved = await job.confirm(ticket.key, job.file).catch(() => ({ error: "Upload failed." }) as UploadOutcome);
    if (!saved.ok) {
      errors.push(uploadFailure(name, saved.error ?? "Upload failed."));
      continue;
    }
    if (saved.warning) warnings.push(saved.warning);
    uploaded += 1;
  }

  return { uploaded, total, errors, warnings, summary: summarise(uploaded, total, cancelled), cancelled };
}

function summarise(uploaded: number, total: number, cancelled: boolean) {
  if (total === 0) return null;
  if (cancelled) return `Cancelled. ${uploaded} of ${total} ${total === 1 ? "file" : "files"} uploaded.`;
  if (uploaded === total) return null;
  // A single failure is already spelled out in the error list; a count would just repeat it.
  if (total === 1) return null;
  return `${uploaded} of ${total} files uploaded.`;
}

/** Storage answers failures with an XML body; its code says far more than the status. */
function storageErrorMessage(status: number, body: string) {
  const code = /<Code>([^<]+)<\/Code>/.exec(body)?.[1];
  if (code === "EntityTooLarge") return "That file is larger than the upload allows.";
  if (code === "SignatureDoesNotMatch" || code === "AccessDenied") {
    return "The upload link was rejected. Try again.";
  }
  if (code) return `The file could not be sent (${code}).`;
  return `The file could not be sent (error ${status}).`;
}

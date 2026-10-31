import crypto from "node:crypto";
import { put, del } from "@vercel/blob";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/zip",
  "text/plain",
]);

export interface UploadResult {
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

export async function uploadFile(
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new AppError(
      "FILE_TOO_LARGE",
      "File size exceeds maximum allowed limit of 5 MB.",
      HTTP_STATUS.UNPROCESSABLE,
    );
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError(
      "INVALID_FILE_TYPE",
      `File type "${mimeType}" is not supported. Allowed: images, PDF, ZIP, TXT.`,
      HTTP_STATUS.UNPROCESSABLE,
    );
  }

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const extension = filename.split(".").pop() || "bin";
  const uniqueKey = `uploads/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;

  // If Vercel Blob token is set, upload to Vercel Blob CDN
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(uniqueKey, buffer, {
        access: "public",
        contentType: mimeType,
      });

      return {
        storageKey: uniqueKey,
        url: blob.url,
        filename,
        mimeType,
        sizeBytes: buffer.length,
        sha256,
      };
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: generate data URI (useful for local development and test environments)
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return {
    storageKey: uniqueKey,
    url: dataUrl,
    filename,
    mimeType,
    sizeBytes: buffer.length,
    sha256,
  };
}

export async function deleteFile(url: string): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN && url.startsWith("https://")) {
    try {
      await del(url);
    } catch {
      // Ignore deletion errors on CDN
    }
  }
}


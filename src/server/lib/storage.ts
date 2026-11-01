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

function verifyFileSignature(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length === 0) return true; // Allow empty text files if needed

  switch (mimeType) {
    case "application/pdf":
      return buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF";

    case "image/png":
      return (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );

    case "image/jpeg":
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    case "image/gif":
      return (
        buffer.length >= 6 &&
        (buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
          buffer.subarray(0, 6).toString("ascii") === "GIF89a")
      );

    case "image/webp":
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );

    case "application/zip":
      return (
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04
      );

    case "text/plain":
      return !buffer.includes(0x00);

    default:
      return false;
  }
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

  if (!verifyFileSignature(buffer, mimeType)) {
    throw new AppError(
      "INVALID_FILE_SIGNATURE",
      "File content signature does not match the specified MIME type header.",
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

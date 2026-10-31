import { describe, expect, it } from "vitest";
import { uploadFile } from "@/server/lib/storage";

describe("storage service", () => {
  it("rejects files that exceed maximum size", async () => {
    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    await expect(uploadFile("huge.pdf", hugeBuffer, "application/pdf")).rejects.toThrow(
      /File size exceeds maximum allowed limit/,
    );
  });

  it("rejects unsupported MIME types", async () => {
    const buffer = Buffer.from("malicious payload");
    await expect(uploadFile("script.sh", buffer, "application/x-sh")).rejects.toThrow(
      /File type "application\/x-sh" is not supported/,
    );
  });

  it("successfully processes valid file and computes sha256 checksum", async () => {
    const textBuffer = Buffer.from("Hello WorkNest attachment");
    const result = await uploadFile("readme.txt", textBuffer, "text/plain");

    expect(result.filename).toBe("readme.txt");
    expect(result.mimeType).toBe("text/plain");
    expect(result.sizeBytes).toBe(textBuffer.length);
    expect(result.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.url).toBeTruthy();
  });
});


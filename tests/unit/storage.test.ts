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

  it("rejects mismatched magic bytes / spoofed file extensions", async () => {
    const fakePdfBuffer = Buffer.from("Not a real PDF file header");
    await expect(uploadFile("document.pdf", fakePdfBuffer, "application/pdf")).rejects.toThrow(
      /File content signature does not match/,
    );
  });

  it("successfully uploads valid PDF with true magic bytes", async () => {
    const validPdfBuffer = Buffer.from(
      "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF",
    );
    const result = await uploadFile("contract.pdf", validPdfBuffer, "application/pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.sizeBytes).toBe(validPdfBuffer.length);
  });

  it("successfully processes valid file and computes sha256 checksum", async () => {
    const textBuffer = Buffer.from("Hello WorkWasl attachment");
    const result = await uploadFile("readme.txt", textBuffer, "text/plain");

    expect(result.filename).toBe("readme.txt");
    expect(result.mimeType).toBe("text/plain");
    expect(result.sizeBytes).toBe(textBuffer.length);
    expect(result.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.url).toBeTruthy();
  });
});

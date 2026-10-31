import { describe, expect, it } from "vitest";
import {
  encryptData,
  decryptData,
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  buildTotpUri,
} from "@/server/lib/crypto";

describe("crypto service", () => {
  describe("AES-256-GCM encryption & decryption", () => {
    it("successfully encrypts and decrypts a plaintext secret", () => {
      const sensitiveSecret = "my-super-secret-totp-seed-12345";
      const encrypted = encryptData(sensitiveSecret);

      expect(encrypted).not.toBe(sensitiveSecret);
      expect(encrypted.split(":")).toHaveLength(3);

      const decrypted = decryptData(encrypted);
      expect(decrypted).toBe(sensitiveSecret);
    });

    it("produces non-deterministic ciphertexts for the same plaintext (random IV)", () => {
      const plaintext = "constant-secret";
      const cipher1 = encryptData(plaintext);
      const cipher2 = encryptData(plaintext);

      expect(cipher1).not.toBe(cipher2);
      expect(decryptData(cipher1)).toBe(plaintext);
      expect(decryptData(cipher2)).toBe(plaintext);
    });

    it("throws on corrupted or tampered ciphertext", () => {
      const encrypted = encryptData("secret");
      const parts = encrypted.split(":");
      // tamper with auth tag
      const tamperedTag = "ff".repeat(16);
      const corrupted = `${parts[0]}:${tamperedTag}:${parts[2]}`;

      expect(() => decryptData(corrupted)).toThrow();
    });
  });

  describe("TOTP generation & verification", () => {
    it("generates a valid base32 secret and 6-digit code", () => {
      const secret = generateTotpSecret();
      expect(secret.length).toBeGreaterThanOrEqual(16);

      const code = generateTotpCode(secret);
      expect(code).toMatch(/^\d{6}$/);
      expect(verifyTotpCode(secret, code)).toBe(true);
    });

    it("rejects invalid TOTP codes", () => {
      const secret = generateTotpSecret();
      expect(verifyTotpCode(secret, "000000")).toBe(false);
      expect(verifyTotpCode(secret, "abc")).toBe(false);
      expect(verifyTotpCode(secret, "1234567")).toBe(false);
    });

    it("builds a standard otpauth URI", () => {
      const secret = generateTotpSecret();
      const uri = buildTotpUri("user@example.com", secret, "WorkNest");
      expect(uri).toContain("otpauth://totp/");
      expect(uri).toContain("secret=");
      expect(uri).toContain("issuer=WorkNest");
    });
  });
});


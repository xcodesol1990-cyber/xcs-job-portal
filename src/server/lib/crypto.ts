import crypto from "node:crypto";
import { env } from "@/server/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

function getEncryptionKey(): Buffer {
  const hexKey = env().ENCRYPTION_KEY;
  return Buffer.from(hexKey, "hex");
}

/**
 * Encrypts plaintext using AES-256-GCM with the master ENCRYPTION_KEY.
 * Result format: iv:authTag:ciphertext (all hex encoded)
 */
export function encryptData(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a ciphertext string formatted as iv:authTag:ciphertext.
 */
export function decryptData(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Base32 character set for RFC 3548 / RFC 4648
 */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(byteLength = 20): string {
  const buffer = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) {
      throw new Error(`Invalid base32 character: ${clean[i]}`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates an RFC 6238 TOTP code (6 digits, 30s window).
 */
export function generateTotpCode(
  secretBase32: string,
  timeStep = Math.floor(Date.now() / 1000 / 30),
): string {
  const key = base32ToBuffer(secretBase32);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code allowing +/- 1 window for clock drift.
 */
export function verifyTotpCode(secretBase32: string, token: string, window = 1): boolean {
  if (!/^\d{6}$/.test(token)) {
    return false;
  }

  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let step = currentStep - window; step <= currentStep + window; step++) {
    if (
      crypto.timingSafeEqual(Buffer.from(generateTotpCode(secretBase32, step)), Buffer.from(token))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Generates a standard otpauth:// URL for authenticator apps (Google Authenticator, etc.)
 */
export function buildTotpUri(
  accountEmail: string,
  secretBase32: string,
  issuer = "WorkWasl",
): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const encIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

import { describe, expect, it } from "vitest";
import { redactText, redactValue } from "@/server/lib/logger";

describe("logger redaction", () => {
  it("redacts emails and bearer tokens in free text", () => {
    expect(redactText("Contact ada@example.com with Bearer abc.def")).toBe(
      "Contact [REDACTED_EMAIL] with Bearer [REDACTED]",
    );
  });

  it("redacts sensitive object keys", () => {
    expect(
      redactValue({
        email: "ada@example.com",
        password: "super-secret",
        nested: { token: "abc", note: "ok" },
      }),
    ).toEqual({
      email: "[REDACTED]",
      password: "[REDACTED]",
      nested: { token: "[REDACTED]", note: "ok" },
    });
  });
});

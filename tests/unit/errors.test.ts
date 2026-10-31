import { describe, expect, it } from "vitest";
import { AppError, HTTP_STATUS, toErrorBody } from "@/server/lib/errors";

describe("toErrorBody", () => {
  it("maps AppError fields into the standard envelope", () => {
    const result = toErrorBody(
      new AppError("FORBIDDEN", "No access", HTTP_STATUS.FORBIDDEN, { resource: "job" }),
      "req-1",
    );
    expect(result.status).toBe(403);
    expect(result.body).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "No access",
        details: { resource: "job" },
        requestId: "req-1",
      },
    });
  });

  it("maps Postgres unique violations to 409", () => {
    const result = toErrorBody({ code: "23505" }, "req-2");
    expect(result.status).toBe(409);
    expect(result.body.error.code).toBe("CONFLICT");
    expect(result.body.error.requestId).toBe("req-2");
  });

  it("maps Prisma unique violations to 409", () => {
    const result = toErrorBody({ code: "P2002", meta: { target: ["email"] } }, "req-3");
    expect(result.status).toBe(409);
    expect(result.body.error.message).not.toMatch(/P2002|email/);
  });

  it("hides unknown errors", () => {
    const result = toErrorBody(new Error("relation users does not exist"), "req-4");
    expect(result.status).toBe(500);
    expect(result.body.error.message).toBe("An unexpected error occurred.");
    expect(JSON.stringify(result.body)).not.toContain("relation users");
  });
});

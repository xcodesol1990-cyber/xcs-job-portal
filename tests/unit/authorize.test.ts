import { describe, expect, it } from "vitest";
import { AppError } from "@/server/lib/errors";
import { assertAuthorized, authorize } from "@/server/policies/authorize";

describe("authorize", () => {
  it("denies anonymous users by default", () => {
    expect(authorize(null, { action: "job.create" })).toBe(false);
  });

  it("denies banned users even with admin role", () => {
    expect(
      authorize({ id: "1", roles: ["ADMIN"], status: "BANNED" }, { action: "admin.users.list" }),
    ).toBe(false);
  });

  it("allows admin actions for active admins", () => {
    expect(
      authorize({ id: "1", roles: ["ADMIN"], status: "ACTIVE" }, { action: "admin.users.list" }),
    ).toBe(true);
  });

  it("denies unmapped actions", () => {
    expect(
      authorize({ id: "1", roles: ["CLIENT"], status: "ACTIVE" }, { action: "job.create" }),
    ).toBe(false);
  });

  it("throws AppError on failed assertion", () => {
    expect(() => assertAuthorized(null, { action: "job.create" })).toThrow(AppError);
  });
});

import { AppError, HTTP_STATUS } from "@/server/lib/errors";

export type Actor = {
  id: string;
  roles: string[];
  status: string;
} | null;

export type AuthorizationContext = {
  action: string;
  resource?: Record<string, unknown>;
};

export function authorize(actor: Actor, context: AuthorizationContext): boolean {
  if (!actor) {
    return false;
  }
  if (actor.status === "BANNED" || actor.status === "SUSPENDED" || actor.status === "DELETED") {
    return false;
  }
  if (actor.roles.includes("ADMIN") && context.action.startsWith("admin.")) {
    return true;
  }
  return false;
}

export function assertAuthorized(actor: Actor, context: AuthorizationContext): void {
  if (!authorize(actor, context)) {
    throw new AppError(
      "FORBIDDEN",
      "You are not allowed to perform this action.",
      HTTP_STATUS.FORBIDDEN,
    );
  }
}

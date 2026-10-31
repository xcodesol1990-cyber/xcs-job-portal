export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL: 500,
} as const;

export type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
};

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type PrismaKnownError = {
  code: string;
  meta?: Record<string, unknown>;
};

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string",
  );
}

export function toErrorBody(
  error: unknown,
  requestId: string,
): { status: number; body: ErrorBody } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      },
    };
  }

  if (isPrismaKnownError(error) && error.code === "P2002") {
    return {
      status: HTTP_STATUS.CONFLICT,
      body: {
        error: {
          code: "CONFLICT",
          message: "A record with those unique values already exists.",
          requestId,
        },
      },
    };
  }

  const pgCode =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : undefined;

  if (pgCode === "23505") {
    return {
      status: HTTP_STATUS.CONFLICT,
      body: {
        error: {
          code: "CONFLICT",
          message: "A record with those unique values already exists.",
          requestId,
        },
      },
    };
  }

  return {
    status: HTTP_STATUS.INTERNAL,
    body: {
      error: {
        code: "INTERNAL",
        message: "An unexpected error occurred.",
        requestId,
      },
    },
  };
}

export function jsonError(error: unknown, requestId: string): Response {
  const { status, body } = toErrorBody(error, requestId);
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "x-request-id": requestId,
    },
  });
}

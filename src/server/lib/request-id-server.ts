import { headers } from "next/headers";
import { REQUEST_ID_HEADER, createRequestId } from "@/server/lib/request-id";

export async function getRequestId(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get(REQUEST_ID_HEADER) ?? createRequestId();
}

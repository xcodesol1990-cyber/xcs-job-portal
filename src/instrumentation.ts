export async function register(): Promise<void> {
  const { loadEnv } = await import("@/server/lib/env");
  loadEnv();
}


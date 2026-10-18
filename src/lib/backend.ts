const configuredBaseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL?.trim();

export function getBackendBaseUrl(): string | null {
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:8000";
  return null;
}

export async function getBackendError(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") return body.detail;
    if (body && typeof body === "object" && "error" in body && typeof body.error === "string") return body.error;
  } catch {
    // The backend may be unreachable or return a non-JSON proxy error.
  }
  return fallback;
}

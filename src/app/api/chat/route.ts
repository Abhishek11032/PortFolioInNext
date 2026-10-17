import { NextResponse, type NextRequest } from "next/server";
import { generatePortfolioAnswer, hasGeminiConfiguration } from "@/lib/ai/gemini";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 12_000;
const MAX_MESSAGES = 6;
const MAX_USER_MESSAGE_LENGTH = 500;
const MAX_ASSISTANT_CONTEXT_LENGTH = 4_000;

function positiveIntegerSetting(name: string, fallback: number, maximum: number) {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

const RATE_LIMIT = positiveIntegerSetting("CHAT_RATE_LIMIT_REQUESTS", 10, 100);
const RATE_WINDOW_MS = positiveIntegerSetting("CHAT_RATE_LIMIT_WINDOW_MS", 60_000, 3_600_000);
const MAX_CONCURRENT_REQUESTS = positiveIntegerSetting("CHAT_MAX_CONCURRENT_REQUESTS", 3, 20);

type RateLimitEntry = { count: number; resetAt: number };
const rateLimits = new Map<string, RateLimitEntry>();
let activeRequests = 0;

function response(body: Record<string, string>, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      ...headers,
    },
  });
}

function getRateLimitKey(request: NextRequest) {
  // Vercel overwrites this header at its edge. Do not trust client IP headers on
  // other hosts unless their reverse proxy is explicitly configured to sanitize them.
  if (process.env.VERCEL === "1") {
    const forwardedIp = request.headers.get("x-vercel-forwarded-for")?.split(",", 1)[0]?.trim();
    if (forwardedIp) return `vercel:${forwardedIp}`;
  }

  return "process-wide";
}

function checkRateLimit(key: string) {
  const now = Date.now();

  if (rateLimits.size > 5_000) {
    for (const [entryKey, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(entryKey);
    }
  }

  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT) {
    return { limited: true, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }

  current.count += 1;
  return { limited: false, retryAfter: 0 };
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Record<string, unknown>;
  const roleIsValid = message.role === "user" || message.role === "assistant";

  return roleIsValid && typeof message.content === "string";
}

function getProviderStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const providerError = error as { status?: unknown; statusCode?: unknown };
  const status = providerError.status ?? providerError.statusCode;
  return typeof status === "number" ? status : undefined;
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return response({ error: "The chat request is too large." }, 413);
  }

  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return response({ error: "Send a valid JSON chat request." }, 400);

    const decoder = new TextDecoder();
    let rawBody = "";
    let bytesRead = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > MAX_BODY_BYTES) {
        await reader.cancel();
        return response({ error: "The chat request is too large." }, 413);
      }
      rawBody += decoder.decode(value, { stream: true });
    }
    rawBody += decoder.decode();
    body = JSON.parse(rawBody);
  } catch {
    return response({ error: "Send a valid JSON chat request." }, 400);
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as Record<string, unknown>).messages)) {
    return response({ error: "The request must include a messages array." }, 400);
  }

  const messages = (body as { messages: unknown[] }).messages;
  if (messages.length === 0 || messages.length > MAX_MESSAGES || !messages.every(isChatMessage)) {
    return response({ error: `Include between 1 and ${MAX_MESSAGES} valid messages.` }, 400);
  }

  const validatedMessages = messages as ChatMessage[];
  if (validatedMessages.some(({ content }) => content.trim().length === 0)) {
    return response({ error: "Messages cannot be empty." }, 400);
  }
  if (validatedMessages.some(({ role, content }) => role === "user" && content.length > MAX_USER_MESSAGE_LENGTH)) {
    return response({ error: `Your question must be no more than ${MAX_USER_MESSAGE_LENGTH} characters.` }, 400);
  }
  if (validatedMessages.some(({ role, content }) => role === "assistant" && content.length > MAX_ASSISTANT_CONTEXT_LENGTH)) {
    return response({ error: "Conversation context is too long. Start a new chat and try again." }, 400);
  }
  if (validatedMessages[validatedMessages.length - 1]?.role !== "user") {
    return response({ error: "The latest message must be from you." }, 400);
  }

  const limit = checkRateLimit(getRateLimitKey(request));
  if (limit.limited) {
    return response({ error: "Too many questions just now. Please try again in a minute." }, 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  if (!hasGeminiConfiguration()) {
    return response({ error: "Assistant is not configured yet. Add GEMINI_API_KEY on the server and restart the app." }, 503);
  }

  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return response({ error: "The assistant is busy. Please try again shortly." }, 503);
  }

  activeRequests += 1;
  try {
    const answer = await generatePortfolioAnswer(validatedMessages);
    return response({ answer }, 200);
  } catch (error) {
    if (error instanceof Error && error.message === "GEMINI_CONFIGURATION_MISSING") {
      return response({ error: "Assistant is not configured yet. Add GEMINI_API_KEY on the server and restart the app." }, 503);
    }

    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return response({ error: "The assistant took too long to respond. Please try again." }, 503);
    }

    if (error instanceof Error && error.message === "GEMINI_RESPONSE_INCOMPLETE") {
      return response({ error: "The assistant could not finish that answer. Please try again." }, 502);
    }

    if (error instanceof Error && (error.message === "GEMINI_RESPONSE_BLOCKED" || error.message === "GEMINI_EMPTY_RESPONSE")) {
      return response({ error: "The assistant could not generate a complete answer for that question." }, 502);
    }

    const providerStatus = getProviderStatus(error);
    if (providerStatus === 429) {
      return response({ error: "The assistant has reached its provider limit. Please try again later." }, 429);
    }

    return response({ error: "The assistant is temporarily unavailable. Please try again." }, 503);
  } finally {
    activeRequests -= 1;
  }
}

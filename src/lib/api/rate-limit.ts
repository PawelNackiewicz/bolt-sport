import { ApiError } from "./errors";

type Bucket = {
  count: number;
  /** Epoch ms at which the current window ends. */
  resetAt: number;
};

/** Kept on `globalThis` for the same hot-reload reason as the data store. */
const globalForLimiter = globalThis as unknown as {
  __boltSportRateLimit?: Map<string, Bucket>;
};

const buckets: Map<string, Bucket> = (globalForLimiter.__boltSportRateLimit ??= new Map());

export type RateLimitOptions = {
  /** Requests allowed per window. */
  limit: number;
  windowSeconds: number;
};

/**
 * Fixed-window limiter keyed by `name + client IP`.
 *
 * MOCK: in-process only. Behind multiple instances each would keep its own
 * counters — a real deployment would put this in Redis.
 */
export function enforceRateLimit(
  request: Request,
  name: string,
  { limit, windowSeconds }: RateLimitOptions,
): void {
  const key = `${name}:${clientIp(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw new ApiError("RATE_LIMITED", {
      message: `Zbyt wiele żądań — spróbuj ponownie za ${retryAfter} s`,
      // Sent separately so every locale can render the countdown, not just the
      // Polish wire message.
      params: { retryAfter },
    });
  }
}

/**
 * `NextRequest.ip` was removed, so the client address comes from proxy headers.
 * Falls back to a constant, which in local development means all callers share
 * one bucket — acceptable for a mock limiter.
 */
function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "local";
}

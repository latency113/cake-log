import { Elysia } from "elysia";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const prune = (now: number) => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
};

/**
 * Simple in-memory per-IP rate limiter. Single-instance only (fine for this
 * deployment); a multi-instance setup would need a shared store.
 */
export const rateLimit = (opts: {
  windowMs: number;
  max: number;
  match: (path: string, method: string) => boolean;
}) =>
  new Elysia({ name: `rate-limit-${opts.max}-${opts.windowMs}` }).onRequest(
    ({ request }) => {
      const url = new URL(request.url);
      if (!opts.match(url.pathname, request.method)) return;

      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const key = `${ip}:${url.pathname}`;
      const now = Date.now();

      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt < now) {
        bucket = { count: 0, resetAt: now + opts.windowMs };
        buckets.set(key, bucket);
        if (buckets.size > 10000) prune(now);
      }

      bucket.count++;
      if (bucket.count > opts.max) {
        return new Response(
          JSON.stringify({ message: "Too many requests, please try again later." }),
          { status: 429, headers: { "content-type": "application/json" } },
        );
      }
    },
  );

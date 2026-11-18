import { Elysia } from "elysia";

/**
 * Sets defensive HTTP security headers on API responses (skipping Swagger UI in dev).
 */
export const securityHeaders = new Elysia({ name: "security-headers" }).onAfterHandle(
  ({ request, set }) => {
    const pathname = new URL(request.url).pathname;
    if (pathname.startsWith("/docs")) {
      return;
    }

    set.headers["x-content-type-options"] = "nosniff";
    set.headers["x-frame-options"] = "DENY";
    set.headers["referrer-policy"] = "strict-origin-when-cross-origin";
    set.headers["content-security-policy"] = "default-src 'none'; frame-ancestors 'none'";
  }
);

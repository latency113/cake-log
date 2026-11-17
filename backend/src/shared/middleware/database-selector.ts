import { Elysia } from "elysia";
import crypto from "crypto";
import { databaseContext } from "../../providers/database/database.context";
import { getClient } from "../../providers/database/connection-manager";

let cachedActiveYear: string = "2569";

// Verify HS256 JWT signature synchronously. onRequest must stay sync (see note
// below), so we cannot await jwt.verify(); this manual HMAC check is equivalent
// for HS256 and rejects forged/unverified payloads.
const verifyJwtSync = (token: string): { role?: string } | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
    if (header.alg !== "HS256") return null;
  } catch {
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  const sigBuf = Buffer.from(signatureB64);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (typeof payload.exp === "number" && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

// Initialize cachedActiveYear from DB at startup asynchronously
(async () => {
  try {
    const client = getClient();
    const settings = await client.cakeSettings.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { academicYear: true },
    });
    let year = settings?.academicYear;

    // Guard: don't trust a year whose database no longer exists (e.g. it was deleted)
    if (year && year !== "current" && process.env.DATABASE_URL) {
      const dbName = new URL(process.env.DATABASE_URL).pathname.split("/")[1];
      const exists = await client.$queryRawUnsafe<{ count: number }[]>(
        `SELECT 1 as count FROM pg_database WHERE datname='${dbName}_${year}'`,
      );
      if (exists.length === 0) {
        console.warn(
          `[DatabaseSelector] Saved academicYear ${year} has no database, falling back to 2569`,
        );
        year = undefined;
      }
    }

    if (year) {
      cachedActiveYear = year;
    }
  } catch {
    // Fallback to "2569"
  }
})();

export function setActiveAcademicYearCache(year: string) {
  cachedActiveYear = year;
}

export function getActiveAcademicYear(): string {
  return cachedActiveYear;
}

// NOTE: onRequest MUST remain synchronous so AsyncLocalStorage.enterWith() does not lose context across microtasks!
export const databaseSelector = new Elysia()
  .onRequest(({ request }) => {
    const authHeader = request.headers.get("authorization");
    let userRole: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = verifyJwtSync(token);
      if (payload) {
        userRole = payload.role ?? null;
      }
    }

    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
    const requestedYear = request.headers.get("x-academic-year");

    // Only ADMIN or SUPERADMIN can switch academic years; all others are strictly locked to cachedActiveYear
    const finalYear = (isAdmin && requestedYear) ? requestedYear : cachedActiveYear;
    databaseContext.enterWith(finalYear);
  });



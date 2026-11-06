import { Elysia } from "elysia";
import { databaseContext } from "../../providers/database/database.context";
import { getClient } from "../../providers/database/connection-manager";

let cachedActiveYear: string = "2569";

// Initialize cachedActiveYear from DB at startup asynchronously
(async () => {
  try {
    const client = getClient();
    const settings = await client.cakeSettings.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { academicYear: true },
    });
    if (settings?.academicYear) {
      cachedActiveYear = settings.academicYear;
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
      try {
        const parts = authHeader.slice(7).split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
          userRole = payload.role;
        }
      } catch {
        // ignore invalid token
      }
    }

    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
    const requestedYear = request.headers.get("x-academic-year");

    // Only ADMIN or SUPERADMIN can switch academic years; all others are strictly locked to cachedActiveYear
    const finalYear = (isAdmin && requestedYear) ? requestedYear : cachedActiveYear;
    databaseContext.enterWith(finalYear);
  });



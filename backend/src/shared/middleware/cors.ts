import { cors } from "@elysiajs/cors";

// Restrict to known frontend origins (comma-separated in CORS_ORIGIN)
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-academic-year",
    "x-refresh-token",
    "Cache-Control",
    "cache-control",
    "Pragma",
    "pragma",
    "Expires",
    "expires",
    "Accept",
    "X-Requested-With",
  ],
  exposeHeaders: ["x-user-role", "x-username"],
});

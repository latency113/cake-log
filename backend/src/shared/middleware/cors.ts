import { cors } from "@elysiajs/cors";

// Restrict to known frontend origins (comma-separated in CORS_ORIGIN)
// Always allow local development origins so frontend can test against backend
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
];

const envOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultDevOrigins, ...envOrigins]));

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
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

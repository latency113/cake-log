import { cors } from "@elysiajs/cors";

export const corsMiddleware = cors({
  origin: "*",
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

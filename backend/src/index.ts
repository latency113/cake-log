import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { corsMiddleware } from "./shared/middleware/cors";
import { securityHeaders } from "./shared/middleware/security-headers";
import { databaseSelector } from "./shared/middleware/database-selector";
import { app as mainApp } from "./features/controllers";
import logger from "./providers/logger/logger.provider";
import { startBackupScheduler } from "./scheduler";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(corsMiddleware)
  .use(securityHeaders)
  .use(databaseSelector);

// Swagger enumerates every endpoint to anonymous visitors — only for development
if (process.env.NODE_ENV !== "production") {
  app.use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "NVC Cake API",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    })
  );
}

app.use(mainApp).listen(port);


logger.info(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/docs`
);

startBackupScheduler();

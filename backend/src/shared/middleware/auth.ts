import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const auth = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "supersecret",
      })
    )
    .derive(async ({ jwt, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader) {
        return {
          user: null,
        };
      }
      const token = authHeader.split(" ")[1];
      try {
        const profile = await jwt.verify(token);
        return {
          user: profile,
        };
      } catch (error) {
        return {
          user: null,
        };
      }
    })
    .macro(({ onBeforeHandle }) => ({
      isSignIn(enabled: boolean) {
        if (enabled) {
          onBeforeHandle(({ user, error }) => {
            if (!user) return error(401, { message: "Unauthorized" });
          });
        }
      },
      hasRole(role: string | string[]) {
        onBeforeHandle(({ user, error }) => {
          if (!user) return error(401, { message: "Unauthorized" });
          
          const roles = Array.isArray(role) ? role : [role];
          // @ts-ignore
          if (!roles.includes(user.role)) {
             return error(403, { message: "Forbidden" });
          }
        })
      }
    }));

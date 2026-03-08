import { Elysia, t } from "elysia";
import { UserService } from "../../services/User/User.service";
import { TokenService } from "../../services/Token/Token.service";
import { auth } from "@/shared/middleware/auth";

export namespace AuthController {
  export const authController = new Elysia({ prefix: "/auth" })
    .use(auth)
    .post(
      "/login",
      async ({ body, set, jwt: jwtHandler }) => {
        try {
          const { username, password } = body;
          const result = await UserService.login(username, password, jwtHandler);
          set.status = "OK";
          return result;
        } catch (error) {
          console.error(error);
          set.status = "Internal Server Error";
          return "Login failed";
        }
      },
      {
        body: t.Object({
          username: t.String(),
          password: t.String(),
        }),
        response: {
          200: t.Object({
            access_token: t.String(),
            refresh_token: t.String(),
            user: t.Object({
              id: t.String(),
              username: t.String(),
              role: t.String(),
              firstname: t.String(),
              lastname: t.String(),
              email: t.Optional(t.Union([t.String(), t.Null()]))
            })
          }),
          500: t.String(),
        },
        tags: ["Authentication"],
      }
    )
    .guard(
      {
        beforeHandle: ({ user, set }) => {
          if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
          }
        },
        detail: {
          security: [{ bearerAuth: [] }],
        },
      },
      (protectedAuth) =>
        protectedAuth
          .get(
            "/me",
            async ({ jwt: jwtHandler, set, headers, user }) => {
            try {
              const refreshToken = headers["x-refresh-token"];

              if (!user) {
                if (refreshToken) {
                  const tokenRecord = await TokenService.verifyToken(refreshToken);
                  if (tokenRecord) {
                    const newPayload = {
                      role: tokenRecord.user.role,
                      username: tokenRecord.user.username,
                      sub: tokenRecord.user_id
                    };
                    const newToken = await jwtHandler.sign(newPayload);
                    set.status = 200;
                    set.headers["x-user-role"] = tokenRecord.user.role;
                    set.headers["x-username"] = tokenRecord.user.username;
                    return {
                      ...tokenRecord.user,
                      access_token: newToken
                    };
                  }
                }
                set.status = 401;
                return { message: "Unauthorized" };
              }

              const fullUser = await UserService.findById((user as any).sub as string);
              if (!fullUser) {
                set.status = 401;
                return { message: "User not found" };
              }

              set.status = 200;
              set.headers["x-user-role"] = fullUser.role;
              set.headers["x-username"] = fullUser.username;
              return {
                id: fullUser.id,
                username: fullUser.username,
                role: fullUser.role,
                firstname: fullUser.firstname,
                lastname: fullUser.lastname,
                email: fullUser.email,
                teacher_id: fullUser.teacher_id,
                teacher: (fullUser as any).teacher,
              };
            } catch (error) {
              console.error(error);
              set.status = "Internal Server Error";
              return "Failed";
            }
          },
          {
            response: {
              200: t.Object({
                id: t.String(),
                username: t.String(),
                role: t.String(),
                firstname: t.String(),
                lastname: t.String(),
                email: t.Optional(t.Union([t.String(), t.Null()])),
                teacher: t.Optional(t.Any()),
                ownedBooks: t.Optional(t.Array(t.Any())),
                access_token: t.Optional(t.String()),
              }),
              401: t.Object({
                message: t.String()
              }),
              500: t.String()
            },
            tags: ["Authentication"],
          }
        )
        .post(
          "/logout",
          async ({ headers, set }) => {
            try {
              const refreshToken = headers["x-refresh-token"];
              if (!refreshToken) {
                set.status = 400;
                return { message: "Refresh token missing" };
              }

              await TokenService.revokeToken(refreshToken);
              set.status = 200;
              return { message: "Logged out successfully" };
            } catch (error) {
              console.error(error);
              set.status = "Internal Server Error";
              return { message: "Failed to logout" };
            }
          },
          {
            response: {
              200: t.Object({
                message: t.String()
              }),
              400: t.Object({
                message: t.String()
              }),
              500: t.Union([t.String(), t.Object({ message: t.String() })])
            },
            tags: ["Authentication"],
          }
        )
    );
}
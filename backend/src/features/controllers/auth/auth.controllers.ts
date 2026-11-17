import { Elysia, t } from "elysia";
import { UserService } from "../../services/User/User.service";
import { TokenService } from "../../services/Token/Token.service";
import { UserRepository } from "../../repository/User/user.repository";
import prisma from "@/providers/database/database.provider";
import { auth } from "@/shared/middleware/auth";
import { rateLimit } from "@/shared/middleware/rate-limit";

export namespace AuthController {
  export const authController = new Elysia({ prefix: "/auth" })
    .use(auth)
    .use(
      rateLimit({
        windowMs: 60_000,
        max: 10,
        match: (path, method) =>
          method === "POST" &&
          (path.endsWith("/auth/login") || path.endsWith("/auth/register")),
      }),
    )
    .use(
      rateLimit({
        windowMs: 60_000,
        max: 20,
        match: (path, method) =>
          method === "GET" && path.includes("/auth/check-username"),
      }),
    )
    .post(
      "/login",
      async ({ body, set, jwt: jwtHandler }) => {
        try {
          const { username, password } = body;
          const result = await UserService.login(username, password, jwtHandler);

          // If maintenance mode is active, only allow SUPERADMIN and ADMIN to login
          const userRole = result?.user?.role;
          if (userRole !== "SUPERADMIN" && userRole !== "ADMIN") {
            const { CakeSettingsRepository } = await import("@/features/repository/CakeSettings/CakeSettings.repository");
            const settings = await CakeSettingsRepository.getCakeSettings();
            if (settings?.isMaintenanceMode) {
              set.status = 503;
              return {
                message: settings.maintenanceMessage || "ระบบอยู่ในโหมดปิดปรับปรุงชั่วคราว เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าสู่ระบบได้",
              };
            }
          }

          set.status = "OK";
          return result;
        } catch (error: any) {
          // Uniform 401 for bad credentials — no user enumeration, no 500
          if (error?.message === "Invalid credentials") {
            set.status = 401;
            return { message: "Invalid credentials" };
          }
          console.error(error);
          set.status = 500;
          return error?.message || "Login failed";
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
          503: t.Object({
            message: t.String()
          }),
          500: t.Union([t.String(), t.Object({ message: t.String() })]),
        },
        tags: ["Authentication"],
      }
    )
    .get(
      "/me",
      async ({ jwt: jwtHandler, set, headers, user }) => {
        try {
          const refreshToken = headers["x-refresh-token"];

          // If no valid access token, attempt refresh token recovery
          if (!user) {
            if (refreshToken) {
              const tokenRecord = await TokenService.verifyToken(refreshToken);
              if (tokenRecord) {
                const newPayload = {
                  role: tokenRecord.user.role,
                  username: tokenRecord.user.username,
                  sub: tokenRecord.user_id,
                };
                const newToken = await jwtHandler.sign({
                  ...newPayload,
                  exp: "15m",
                });
                set.status = 200;
                set.headers["x-user-role"] = tokenRecord.user.role;
                set.headers["x-username"] = tokenRecord.user.username;
                return {
                  ...tokenRecord.user,
                  access_token: newToken,
                };
              }
            }
            set.status = 401;
            return { message: "Unauthorized" };
          }

          const userId = (user as { sub?: string }).sub;
          if (!userId) {
            set.status = 401;
            return { message: "Unauthorized" };
          }

          const fullUser = await UserService.findById(userId);
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
            teacher: (fullUser as { teacher?: unknown }).teacher,
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
            message: t.String(),
          }),
          500: t.String(),
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
            message: t.String(),
          }),
          400: t.Object({
            message: t.String(),
          }),
          500: t.Union([t.String(), t.Object({ message: t.String() })]),
        },
        tags: ["Authentication"],
      }
    )
    .get(
      "/classrooms",
      async ({ set }) => {
        try {
          const classrooms = await prisma.classroom.findMany({
            include: {
              department: true,
              grade_level: true,
              teacher: {
                include: {
                  users: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              {
                department: {
                  name: "asc",
                },
              },
              {
                grade_level: {
                  level: "desc",
                },
              },
              {
                grade_level: {
                  year: "asc",
                },
              },
              {
                name: "asc",
              },
            ],
          });

          const classroomsWithStatus = classrooms.map((cls) => {
            const hasAccount = Boolean(
              cls.teacher?.users && cls.teacher.users.length > 0
            );
            return {
              ...cls,
              teacher: cls.teacher
                ? {
                    ...cls.teacher,
                    hasAccount,
                    isRegistered: hasAccount,
                  }
                : null,
            };
          });

          return classroomsWithStatus;
        } catch (error) {
          console.error("Error fetching classrooms for register:", error);
          set.status = 500;
          return { message: "Failed to fetch classrooms" };
        }
      },
      {
        tags: ["Authentication"],
      }
    )
    .get(
      "/check-username/:username",
      async ({ params, set }) => {
        try {
          const existing = await UserService.findByUsername(params.username);
          return { available: !existing };
        } catch (error) {
          console.error("Error checking username:", error);
          set.status = 500;
          return { available: false, message: "Error checking username" };
        }
      },
      {
        params: t.Object({
          username: t.String(),
        }),
        tags: ["Authentication"],
      }
    )
    .post(
      "/register",
      async ({ body, set }) => {
        try {
          const { firstname, lastname, username, password, email, classroom_id } = body;

          // Verify classroom exists and retrieve its teacher_id
          const classroom = await prisma.classroom.findUnique({
            where: { id: classroom_id },
            include: {
              teacher: {
                include: {
                  users: true,
                },
              },
            },
          });

          if (!classroom) {
            set.status = 400;
            return { message: "ไม่พบห้องเรียนที่เลือก" };
          }

          if (!classroom.teacher_id || !classroom.teacher) {
            set.status = 400;
            return { message: "ห้องเรียนนี้ยังไม่ได้กำหนดครูประจำชั้นในระบบ" };
          }

          // Check if this teacher already has an account in User table
          const existingTeacherUser = await prisma.user.findFirst({
            where: { teacher_id: classroom.teacher_id },
          });

          if (existingTeacherUser || (classroom.teacher.users && classroom.teacher.users.length > 0)) {
            set.status = 409;
            return {
              message: `ครูประจำชั้น/ที่ปรึกษา (${classroom.teacher.name}) มีบัญชีผู้ใช้งานในระบบแล้ว ไม่สามารถลงทะเบียนซ้ำได้ เพื่อป้องกันการสวมสิทธิ์ หากลืมรหัสผ่านกรุณาติดต่อผู้ดูแลระบบ`,
            };
          }

          const existingUser = await UserRepository.findUserByUsername(username);
          if (existingUser) {
            set.status = 409;
            return { message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" };
          }

          const newUser = await UserService.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            username: username.trim(),
            password: password,
            email: email ? email.trim() : null,
            role: "USER",
            teacher_id: classroom.teacher_id,
          });

          set.status = 201;
          return {
            message: "ลงทะเบียนผู้ใช้งานสำเร็จ",
            user: {
              id: newUser.id,
              username: newUser.username,
              firstname: newUser.firstname,
              lastname: newUser.lastname,
              role: newUser.role,
              teacher_id: newUser.teacher_id,
            },
          };
        } catch (error: any) {
          console.error("Registration error:", error);
          if (error.message === "Username already exists") {
            set.status = 409;
            return { message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" };
          }
          set.status = 500;
          return { message: error.message || "การลงทะเบียนล้มเหลว" };
        }
      },
      {
        body: t.Object({
          firstname: t.String(),
          lastname: t.String(),
          // Letters, digits, underscore only — username is used in generated
          // usernames and displayed broadly
          username: t.String({ pattern: "^[a-zA-Z0-9_]{3,30}$" }),
          password: t.String({ minLength: 8 }),
          email: t.Optional(t.Union([t.String(), t.Null()])),
          classroom_id: t.String(),
        }),
        response: {
          201: t.Object({
            message: t.String(),
            user: t.Object({
              id: t.String(),
              username: t.String(),
              firstname: t.String(),
              lastname: t.String(),
              role: t.String(),
              teacher_id: t.Optional(t.Union([t.String(), t.Null()])),
            }),
          }),
          400: t.Object({ message: t.String() }),
          409: t.Object({ message: t.String() }),
          500: t.Object({ message: t.String() }),
        },
        tags: ["Authentication"],
      }
    );

}
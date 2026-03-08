import Elysia, { t } from "elysia";
import { CreateUserDto, UpdateUserDto, UserSchema } from "../../services/User/User.schema";
import { UserService } from "../../services/User/User.service";
import jwt from "@elysiajs/jwt";
import { auth } from "@/shared/middleware/auth";

export namespace UserController {
  export const userController = new Elysia({ prefix: "/users" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newUser = await UserService.create(body);
          set.status = 201;
          return {  newUser, message: "User has created" };
        } catch (error: any) {
          if (error.message === "Username already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: CreateUserDto,
        response: {
          201: t.Object({
            newUser: UserSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Users"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .get(
      "/",
      async ({ query, set }) => {
        const page = query.page ? Number(query.page) : 1;
        const itemsPerPage = query.itemsPerPage
          ? Number(query.itemsPerPage)
          : 10;
        const search = query.search;

        const result = await UserService.findAll({
          page,
          itemsPerPage,
          search,
        });

        return result;
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric()),
          itemsPerPage: t.Optional(t.Numeric()),
          search: t.Optional(t.String()),
        }),
        response: {
          200: t.Object({
            data: t.Array(UserSchema),
            meta_data: t.Object({
              page: t.Number(),
              itemsPerPage: t.Number(),
              total: t.Number(),
              totalPages: t.Number(),
              nextPage: t.Boolean(),
              previousPage: t.Boolean(),
            }),
          }),
          404: t.Object({
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Users"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .get(
      "/:userId",
      async ({ params, set }) => {
        const getuserById = await UserService.findById(params.userId);
        if (!getuserById) {
          set.status = "Not Found";
          return { message: "User not found" };
        }
        return getuserById;
      },
      {
        params: t.Object({
          userId: t.String(),
        }),
        response: {
          200: UserSchema,
          404: t.Object({ message: t.String() }),
          500: t.String(),
        },
        tags: ["Users"],
        isSignIn: true
      }
    )
    .patch(
      "/:userId",
      async ({ params, body, set }) => {
        try {
          const updateuser = await UserService.update(params.userId, body);
          set.status = "OK";
          return {  updateuser, message: "User has updated" };
        } catch (error: any) {
          if (error.message === "Username already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: UpdateUserDto,
        params: t.Object({
          userId: t.String(),
        }),
        response: {
          200: UserSchema,
          409: t.String(),
          500: t.String(),
        },
        tags: ["Users"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:userId",
      async ({ params, set }) => {
        try {
          const deleteUser = await UserService.deleteById(params.userId);
          set.status = "OK";
          return {deleteUser, message: "User has deleted"};
        } catch (error: any) {
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          userId: t.String(),
        }),
        response: {
          200: UserSchema,
          500: t.String(),
        },
        tags: ["Users"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
}

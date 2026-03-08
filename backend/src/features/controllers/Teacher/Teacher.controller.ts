import Elysia, { t } from "elysia";
import {
  CreateTeacherDto,
  TeacherSchema,
  TeacherWithRelationsSchema,
  UpdateTeacherDto,
} from "../../services/Teacher/Teacher.schema";
import { TeacherService } from "../../services/Teacher/Teacher.service";
import { auth } from "@/shared/middleware/auth";

export namespace TeacherController {
  export const teacherController = new Elysia({ prefix: "/teachers" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newTeacher = await TeacherService.create(body);
          set.status = 201;
          return { newTeacher, message: "Classroom has created" };
        } catch (error: any) {
          if (error.message === "Classroom name already exists") {
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
        body: CreateTeacherDto,
        response: {
          201: t.Object({
            newTeacher: TeacherSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Teachers"],
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

        const result = await TeacherService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No Teacher found matching your search query.",
          };
        }

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
            data: t.Array(TeacherWithRelationsSchema),
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
        tags: ["Teachers"],
        isSignIn: true
      }
    )
    .delete(
      "/clear-all",
      async ({ set }) => {
        try {
          await TeacherService.clearAllTeachers();
          set.status = "OK";
          return { message: "All teachers deleted successfully" };
        } catch (error: any) {
          console.error("Error deleting all teachers:", error);
          set.status = "Internal Server Error";
          return { message: error.message || "Failed to delete all teachers" };
        }
      },
      {
        response: {
          200: t.Object({ message: t.String() }),
          500: t.Object({ message: t.String() }),
        },
        tags: ["Teachers"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .get(
      "/:TeacherId",
      async ({ params }) => {
        const getTeacherById = await TeacherService.findById(params.TeacherId);
        return getTeacherById;
      },
      {
        params: t.Object({
          TeacherId: t.String(),
        }),
        response: {
          200: TeacherSchema,
          500: t.String(),
        },
        tags: ["Teachers"],
        isSignIn: true
      }
    )
    .patch(
      "/:TeacherId",
      async ({ params, body, set }) => {
        try {
          const updateTeacher = await TeacherService.update(
            params.TeacherId,
            body
          );
          set.status = "OK";
          return { updateTeacher, message: "Teacher has updated" };
        } catch (error: any) {
          if (error.message === "Teachername already exists") {
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
        body: UpdateTeacherDto,
        params: t.Object({
          TeacherId: t.String(),
        }),
        response: {
          200: TeacherSchema,
          409: t.String(),
          500: t.String(),
        },
        tags: ["Teachers"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:TeacherId",
      async ({ params, set }) => {
        try {
          const deleteTeacher = await TeacherService.deleteById(
            params.TeacherId
          );
          set.status = "OK";
          return { deleteTeacher, message: "Teacher has deleted" };
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
          TeacherId: t.String(),
        }),
        response: {
          200: TeacherSchema,
          500: t.String(),
        },
        tags: ["Teachers"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    );
}

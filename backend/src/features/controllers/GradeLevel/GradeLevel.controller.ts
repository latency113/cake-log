import Elysia, { t } from "elysia";
import { CreateGradeLevelDto, GradeLevelSchema, GradeLevelWithRelationsSchema, UpdateGradeLevelDto } from "../../services/GradeLevel/GradeLevel.schema";
import { GradeLevelService } from "../../services/GradeLevel/GradeLevel.service";
import { auth } from "@/shared/middleware/auth";

export namespace GradeLevelController {
  export const gradeLevelController = new Elysia({ prefix: "/grade-levels" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newGradeLevel = await GradeLevelService.create(body);
          set.status = 201;
          return {  newGradeLevel, message: "GradeLevel has created" };
        } catch (error: any) {
          if (error.message === "Duplicate GradeLevel (level, year) combination") {
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
        body: CreateGradeLevelDto,
        response: {
          201: t.Object({
            newGradeLevel: GradeLevelSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["GradeLevels"],
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

        const result = await GradeLevelService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No GradeLevel found matching your search query.",
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
            data: t.Array(GradeLevelWithRelationsSchema),
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
        tags: ["GradeLevels"],
        isSignIn: true
      }
    )
    .get(
      "/:GradeLevelId",
      async ({ params }) => {
        const getGradeLevelById = await GradeLevelService.findById(params.GradeLevelId);
        return getGradeLevelById;
      },
      {
        params: t.Object({
          GradeLevelId: t.String(),
        }),
        response: {
          200: GradeLevelWithRelationsSchema,
          500: t.String(),
        },
        tags: ["GradeLevels"],
        isSignIn: true
      }
    )
    .patch(
      "/:GradeLevelId",
      async ({ params, body, set }) => {
        try {
          const updateGradeLevel = await GradeLevelService.update(params.GradeLevelId, body);
          set.status = "OK";
          return {  updateGradeLevel, message: "GradeLevel has updated" };
        } catch (error: any) {
          if (error.message === "Duplicate GradeLevel (level, year) combination") {
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
        body: UpdateGradeLevelDto,
        params: t.Object({
          GradeLevelId: t.String(),
        }),
        response: {
          200: GradeLevelSchema,
          409: t.String(),
          500: t.String(),
        },
        tags: ["GradeLevels"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:GradeLevelId",
      async ({ params, set }) => {
        try {
          const deleteGradeLevel = await GradeLevelService.deleteById(params.GradeLevelId);
          set.status = "OK";
          return {deleteGradeLevel, message: "GradeLevel has deleted"};
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
          GradeLevelId: t.String(),
        }),
        response: {
          200: GradeLevelSchema,
          500: t.String(),
        },
        tags: ["GradeLevels"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
}

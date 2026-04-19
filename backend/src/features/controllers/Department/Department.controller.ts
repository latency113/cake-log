import Elysia, { t } from "elysia";
import { CreateDepartmentDto, DepartmentSchema, DepartmentWithRelationsSchema, UpdateDepartmentDto } from "../../services/Department/Department.schema";
import { DepartmentService } from "../../services/Department/Department.service";
import { auth } from "@/shared/middleware/auth";

export namespace DepartmentController {
  export const departmentController = new Elysia({ prefix: "/departments" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newDepartment = await DepartmentService.create(body);
          set.status = 201;
          return {  newDepartment, message: "Department has created" };
        } catch (error: any) {
          if (error.message === "Department Name already exists") {
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
        body: CreateDepartmentDto,
        response: {
          201: t.Object({
            newDepartment: DepartmentSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Departments"],
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

        const result = await DepartmentService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No Department found matching your search query.",
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
            data: t.Array(DepartmentWithRelationsSchema),
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
        tags: ["Departments"],
        isSignIn: true
      }
    )
    .get(
      "/:DepartmentId",
      async ({ params }) => {
        const getDepartmentById = await DepartmentService.findById(params.DepartmentId);
        return getDepartmentById;
      },
      {
        params: t.Object({
          DepartmentId: t.String(),
        }),
        response: {
          200: DepartmentWithRelationsSchema,
          500: t.String(),
        },
        tags: ["Departments"],
        isSignIn: true
      }
    )
    .patch(
      "/:DepartmentId",
      async ({ params, body, set }) => {
        try {
          const updateDepartment = await DepartmentService.update(params.DepartmentId, body);
          set.status = "OK";
          return {  updateDepartment, message: "Department has updated" };
        } catch (error: any) {
          if (error.message === "Department Name already exists") {
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
        body: UpdateDepartmentDto,
        params: t.Object({
          DepartmentId: t.String(),
        }),
        response: {
          200: DepartmentSchema,
          409: t.String(),
          500: t.String(),
        },
        tags: ["Departments"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:DepartmentId",
      async ({ params, set }) => {
        try {
          const deleteDepartment = await DepartmentService.deleteById(params.DepartmentId);
          set.status = "OK";
          return {deleteDepartment, message: "Department has deleted"};
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
          DepartmentId: t.String(),
        }),
        response: {
          200: DepartmentSchema,
          500: t.String(),
        },
        tags: ["Departments"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .post(
      "/bulk-delete",
      async ({ body, set }) => {
        try {
          await DepartmentService.deleteByIds(body.ids);
          set.status = "OK";
          return { message: "Departments have deleted" };
        } catch (error: any) {
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: t.Object({
          ids: t.Array(t.String()),
        }),
        response: {
          200: t.Object({
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Departments"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
      .delete(
          "/clear-all",
          async ({ set }) => {
            try {
              await DepartmentService.clearAllDepartments();
              set.status = "OK";
              return { message: "All departments deleted successfully" };
            } catch (error: any) {
              console.error("Error deleting all departments:", error);
              set.status = "Internal Server Error";
              return { message: error.message || "Failed to delete all departments" };
            }
          },
          {
            response: {
              200: t.Object({ message: t.String() }),
              500: t.Object({ message: t.String() }),
            },
            tags: ["Departments"],
            isSignIn: true,
            hasRole: ["SUPERADMIN", "ADMIN"]
          }
        )
}

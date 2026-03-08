import Elysia, { t } from "elysia";
import {
  ClassroomSchema,
  ClassroomWithAllRelationsSchema,
  CreateClassroomDto,
  UpdateClassroomDto,
  StudentSchema,
} from "../../services/Classroom/Classroom.schema";
import { promoteAllClassrooms } from "../../services/Classroom/promote.service";
import { ClassroomService } from "../../services/Classroom/Classroom.service";
import { auth } from "@/shared/middleware/auth";

export namespace ClassroomController {
  export const classroomController = new Elysia({ prefix: "/classrooms" })
    .use(auth)

    // --- 1. Static Routes (วางไว้บนสุดเสมอ) ---

    // [NEW ROUTE] API สำหรับ Import Excel ทั้งระบบ (ห้อง/ครู/แผนก/นร.)
    .post(
      "/import",
      async ({ body, set }) => {
        try {
          const { file } = body;
          
          if (!file) {
            set.status = "Bad Request";
            return { message: "Excel file is required" };
          }

          // เรียก Service ตัวใหม่ที่เราเพิ่งสร้าง
          const result = await ClassroomService.importClassroomsFromExcel(file);

          set.status = "Created"; // 201
          return {
            message: "Import process completed successfully",
            importedCount: result.importedCount,
            details: result.details
          };

        } catch (error: any) {
          console.error("Error importing classrooms:", error);
          set.status = "Internal Server Error";
          return { message: error.message || "Failed to import excel file" };
        }
      },
      {
        body: t.Object({
          file: t.File(), // รับแค่ไฟล์อย่างเดียว
        }),
        type: "formdata",
        response: {
          201: t.Object({
            message: t.String(),
            importedCount: t.Number(),
            details: t.Any(), // หรือระบุเป็น t.Array(ClassroomSchema) ถ้าต้องการ type strict
          }),
          400: t.Object({ message: t.String() }),
          500: t.Object({ message: t.String() }),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    // API สำหรับกดเลื่อนชั้นปี (Promote)
    .post(
      "/promote",
      async ({ set }) => {
        try {
          const result = await promoteAllClassrooms();
          if (result.success) {
            set.status = "OK";
            return { message: result.message };
          } else {
            set.status = "Internal Server Error";
            return { error: result.message };
          }
        } catch (error: any) {
          console.error("Error promoting classrooms:", error);
          set.status = "Internal Server Error";
          return { error: "Internal server error during promotion" };
        }
      },
      {
        response: {
          200: t.Object({ message: t.String() }),
          500: t.Object({ error: t.String() }),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    // --- 2. General Routes (Create / Get All) ---
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const { file, ...restOfBody } = body;
          let classroomData: CreateClassroomDto =
            restOfBody as CreateClassroomDto;

          // Parse JSON string if needed
          if (typeof (restOfBody as any).students === "string") {
            try {
              classroomData = {
                ...classroomData,
                students: JSON.parse((restOfBody as any).students),
              };
            } catch (parseError) {
              set.status = "Bad Request";
              return "Invalid students data format.";
            }
          }

          const newClassroom = await ClassroomService.create(classroomData);

          if (file) {
            await ClassroomService.uploadStudentsFromExcel(
              newClassroom.id,
              file
            );
          }

          set.status = 201;
          const classroomWithStudents = await ClassroomService.findById(
            newClassroom.id
          );
          return {
            newClassroom: classroomWithStudents,
            message: "Classroom has created and students uploaded",
          };
        } catch (error: any) {
          if (error.message === "Classroom name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        body: t.Object({
          name: t.String(),
          teacher_id: t.String(),
          department_id: t.String(),
          grade_level_id: t.String(),
          students: t.Optional(t.Union([t.Array(StudentSchema), t.String()])),
          file: t.Optional(t.File()),
        }),
        type: "formdata",
        response: {
          201: t.Object({
            newClassroom: ClassroomWithAllRelationsSchema,
            message: t.String(),
          }),
          400: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
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

        const result = await ClassroomService.findAll({
          page,
          itemsPerPage,
          search,
          department_id: query.department_id // เพิ่ม support filter
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No Classroom found matching your search query.",
          };
        }

        return result;
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric()),
          itemsPerPage: t.Optional(t.Numeric()),
          search: t.Optional(t.String()),
          department_id: t.Optional(t.String()),
        }),
        response: {
          200: t.Object({
            data: t.Array(ClassroomWithAllRelationsSchema),
            meta_data: t.Object({
              page: t.Number(),
              itemsPerPage: t.Number(),
              total: t.Number(),
              totalPages: t.Number(),
              nextPage: t.Boolean(),
              previousPage: t.Boolean(),
            }),
          }),
          404: t.Object({ message: t.String() }),
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    .delete(
      "/clear-all",
      async ({ set }) => {
        try {
          await ClassroomService.clearAllClassrooms();
          set.status = "OK";
          return { message: "All classrooms deleted successfully" };
        } catch (error: any) {
          console.error("Error deleting all classrooms:", error);
          set.status = "Internal Server Error";
          return { message: error.message || "Failed to delete all classrooms" };
        }
      },
      {
        response: {
          200: t.Object({ message: t.String() }),
          500: t.Object({ message: t.String() }),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    // --- 3. Dynamic Routes (/:id) ---
    // (วางไว้ล่างสุด เพื่อป้องกันไม่ให้ /promote หรือ /import ถูกมองว่าเป็น :ClassroomId)

    .post(
      "/:ClassroomId/upload-students",
      async ({ params, body, set }) => {
        try {
          const { ClassroomId } = params;
          const { file } = body;

          if (!file) {
            set.status = "Bad Request";
            return "No file uploaded.";
          }

          const updatedClassroom =
            await ClassroomService.uploadStudentsFromExcel(ClassroomId, file);

          set.status = "OK";
          return {
            updatedClassroom,
            message: "Students uploaded and classroom updated successfully.",
          };
        } catch (error: any) {
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ ClassroomId: t.String() }),
        body: t.Object({ file: t.File() }),
        type: "formdata",
        response: {
          200: t.Object({
            updatedClassroom: ClassroomSchema,
            message: t.String(),
          }),
          400: t.String(),
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    .get(
      "/:ClassroomId/students-with-cake-pounds",
      async ({ params, set }) => {
        try {
          const { ClassroomId } = params;
          const result = await ClassroomService.getStudentsWithCakePounds(
            ClassroomId
          );
          set.status = "OK";
          return result;
        } catch (error: any) {
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ ClassroomId: t.String() }),
        response: {
          200: t.Object({
            students: t.Array(
              t.Object({
                number: t.String(),
                name: t.String(),
                totalPounds: t.Number(),
              })
            ),
            totalPoundsForClassroom: t.Number(),
          }),
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    .get(
      "/:ClassroomId",
      async ({ params }) => {
        const getClassroomById = await ClassroomService.findById(
          params.ClassroomId
        );
        return getClassroomById;
      },
      {
        params: t.Object({ ClassroomId: t.String() }),
        response: {
          200: ClassroomSchema,
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    .patch(
      "/:ClassroomId/finalize",
      async ({ params, set }) => {
        try {
          const { ClassroomId } = params;
          const updatedClassroom = await ClassroomService.finalizeClassroomOrders(
            ClassroomId
          );
          set.status = "OK";
          return {
            updatedClassroom,
            message: "Classroom orders finalized successfully.",
          };
        } catch (error: any) {
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ ClassroomId: t.String() }),
        response: {
          200: t.Object({
            updatedClassroom: ClassroomSchema,
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    .patch(
      "/:ClassroomId",
      async ({ params, body, set }) => {
        try {
          const { ClassroomId } = params;
          const file = (body as any).file;

          let updatedClassroom;
          let message = "Classroom has updated";

          if (file) {
            const { students, ...restOfBody } = body as any;
            await ClassroomService.uploadStudentsFromExcel(ClassroomId, file);
            updatedClassroom = await ClassroomService.findById(ClassroomId);

            if (Object.keys(restOfBody).length > 0) {
              const dataToUpdate = { ...restOfBody };
              if (dataToUpdate.students) delete dataToUpdate.students;
              updatedClassroom = await ClassroomService.update(
                ClassroomId,
                dataToUpdate as UpdateClassroomDto
              );
            }
            message = "Classroom and students updated successfully";
          } else {
            let dataToUpdate: UpdateClassroomDto = body as UpdateClassroomDto;

            if (typeof (body as any).students === "string") {
              try {
                dataToUpdate = {
                  ...dataToUpdate,
                  students: JSON.parse((body as any).students),
                };
              } catch (parseError) {
                set.status = "Bad Request";
                return "Invalid students data format.";
              }
            }
            updatedClassroom = await ClassroomService.update(
              ClassroomId,
              dataToUpdate
            );
          }

          set.status = "OK";
          return { updateClassroom: updatedClassroom, message };
        } catch (error: any) {
          if (error.message === "Classroom name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        body: t.Object({
          name: t.Optional(t.String()),
          teacher_id: t.Optional(t.String()),
          department_id: t.Optional(t.String()),
          grade_level_id: t.Optional(t.String()),
          students: t.Optional(t.Union([t.Array(StudentSchema), t.String()])),
          file: t.Optional(t.File()),
        }),
        type: "formdata",
        params: t.Object({ ClassroomId: t.String() }),
        response: {
          200: t.Object({
            updateClassroom: ClassroomWithAllRelationsSchema,
            message: t.String(),
          }),
          400: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    )

    .delete(
      "/:ClassroomId",
      async ({ params, set }) => {
        try {
          const deleteClassroom = await ClassroomService.deleteById(
            params.ClassroomId
          );
          set.status = "OK";
          return { deleteClassroom, message: "Classroom has deleted" };
        } catch (error: any) {
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ ClassroomId: t.String() }),
        response: {
          200: ClassroomSchema,
          500: t.String(),
        },
        tags: ["Classrooms"],
        isSignIn: true
      }
    );
}
import { Elysia, t } from "elysia"; // Import 't' for schema validation
import { performBackup } from "../../services/admin/backup.service";
import { performRestore, performRestorePrePromotion, listBackups, getBackupFilePath } from "../../services/admin/restore.service";
import { TeacherUserService } from "@/features/services/Teacher/TeacherUser.service"; // Import the new service
import { CakeSettingsService } from "@/features/services/admin/setting.service";
import { InitYearService } from "@/features/services/admin/init-year.service";
import { auth } from "@/shared/middleware/auth";
import { OrderService } from "../../services/Order/Order.service";
import { ClassroomService } from "../../services/Classroom/Classroom.service";

export const adminController = new Elysia()
  .use(auth)
  .post(
    "/backup",
    async ({ body, set }) => {
      try {
        const backupResult = await performBackup(body?.tag);
        set.status = 200;
        return { message: "Backup successful", data: backupResult };
      } catch (error: any) {
        console.error("Backup failed:", error);
        set.status = 500;
        return { message: "Backup failed", error: error.message };
      }
    },
    { 
      body: t.Optional(t.Object({
        tag: t.Optional(t.String())
      })),
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .get(
    "/backups",
    async ({ set }) => {
      try {
        const backups = await listBackups();
        set.status = 200;
        return { backups };
      } catch (error: any) {
        console.error("Failed to list backups:", error);
        set.status = 500;
        return { message: "Failed to list backups", error: error.message };
      }
    },
    {
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .post(
    "/restore-backup",
    async ({ body, set }) => {
      try {
        const restoreResult = await performRestore(body?.fileName, body?.key);
        set.status = 200;
        return { message: "Restore successful", data: restoreResult };
      } catch (error: any) {
        console.error("Restore failed:", error);
        set.status = 403;
        return { message: "Restore failed", error: error.message };
      }
    },
    { 
      body: t.Optional(t.Object({
        fileName: t.Optional(t.String()),
        key: t.Optional(t.String())
      })),
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .post(
    "/restore-pre-promotion-backup",
    async ({ body, set }) => {
      try {
        const restoreResult = await performRestorePrePromotion(body?.key);
        set.status = 200;
        return { message: "Restore successful", data: restoreResult };
      } catch (error: any) {
        console.error("Restore failed:", error);
        set.status = 403;
        return { message: "Restore failed", error: error.message };
      }
    },
    { 
      body: t.Optional(t.Object({
        key: t.Optional(t.String())
      })),
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .post(
    "/download-backup",
    async ({ body, set }) => {
      try {
        const filePath = await getBackupFilePath(body.fileName, body.key);
        set.headers["Content-Disposition"] = `attachment; filename="${body.fileName}"`;
        return Bun.file(filePath);
      } catch (error: any) {
        console.error("Download failed:", error);
        set.status = 403;
        return { message: "Download failed", error: error.message };
      }
    },
    {
      body: t.Object({
        fileName: t.String(),
        key: t.String()
      }),
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .post(
    "/create-teacher-users",
    async ({ body, set }) => {
      try {
        const { createdUsers, errors } =
          await TeacherUserService.createUsersFromTeachers(
            body.defaultPassword
          );
        set.status = 200;
        return {
          message: "Bulk teacher user creation process completed.",
          data: {
            createdCount: createdUsers.length,
            errorCount: errors.length,
            createdUsers: createdUsers.map((u) => ({
              username: u.username,
              firstname: u.firstname,
              lastname: u.lastname,
            })),
            errors: errors,
          },
        };
      } catch (error: any) {
        console.error("Bulk teacher user creation failed:", error);
        set.status = 500;
        return {
          message: "Bulk teacher user creation failed",
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        defaultPassword: t.Optional(t.String()),
      }),
      detail: {
        description:
          "Creates user accounts for all existing teachers, generating usernames and assigning a default role.",
        tags: ["Admin"],
      },
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .get(
    "/system-active-year",
    async () => {
      const originalUrl = process.env.DATABASE_URL;
      if (!originalUrl) throw new Error("DATABASE_URL is not set");
      
      const { PrismaClient } = await import("@/providers/database/generated/client");
      const client = new PrismaClient({
        datasources: { db: { url: originalUrl } },
      });
      
      try {
        const settings = await client.cakeSettings.findFirst({
          orderBy: { updatedAt: 'desc' }
        });
        return { academicYear: settings?.academicYear || "2569" };
      } finally {
        await client.$disconnect();
      }
    },
    {
      tags: ["Admin"],
      detail: { description: "Get the system-wide active academic year" }
    }
  )
  // New endpoints for cake settings
  .get(
    "/cake-settings",
    async ({ set, user }) => {
      try {
        const settings = await CakeSettingsService.getSettings();
        set.status = 200;
        
        if (settings && user) {
          const typedUser = user as { role: string };
          if (typedUser.role !== "SUPERADMIN" && typedUser.role !== "ADMIN") {
            const { securityKey, ...safeSettings } = settings as any;
            return safeSettings;
          }
        }
        
        return settings;
      } catch (error: any) {
        console.error("Failed to fetch cake settings:", error);
        set.status = 500;
        return { message: "Failed to fetch cake settings", error: error.message };
      }
    },
    { 
      tags: ["Admin"],
      isSignIn: true,
    }
  )
  .post(
    "/cake-settings",
    async ({ body, set }) => {
      try {
        const updatedSettings = await CakeSettingsService.createSettings(body);
        set.status = 200;
        return { message: "Cake settings updated successfully", data: updatedSettings };
      } catch (error: any) {
        console.error("Failed to update cake settings:", error);
        set.status = 500;
        return { message: "Failed to update cake settings", error: error.message };
      }
    },
    {
      body: t.Object({
        academicYear: t.Optional(t.String()),
        currentYear: t.Optional(t.String()),
        pickupStartDate: t.Optional(t.String()), // ISO string
        pickupEndDate: t.Optional(t.String()),   // ISO string
        pickupStartTime: t.Optional(t.String()),
        pickupEndTime: t.Optional(t.String()),
        reporterName: t.Optional(t.String()),
        securityKey: t.Optional(t.String()),
      }),
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .post(
    "/init-year",
    async ({ body, set }) => {
      try {
        const result = await InitYearService.initializeYear(body.year);
        set.status = 200;
        return result;
      } catch (error: any) {
        console.error("Year initialization failed:", error);
        set.status = 500;
        return { message: "Year initialization failed", error: error.message };
      }
    },
    {
      body: t.Object({
        year: t.String(),
      }),
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN"]
    }
  )
  .get(
    "/available-years",
    async ({ set }) => {
      try {
        const years = await InitYearService.getAvailableYears();
        set.status = 200;
        return { years };
      } catch (error: any) {
        console.error("Failed to fetch available years:", error);
        set.status = 500;
        return { message: "Failed to fetch available years", error: error.message };
      }
    },
    {
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN", "ADMIN"]
    }
  )
  .delete(
    "/year/:year",
    async ({ params, set }) => {
      try {
        const result = await InitYearService.deleteYear(params.year);
        set.status = 200;
        return result;
      } catch (error: any) {
        console.error("Failed to delete year:", error);
        set.status = 500;
        return { message: "Failed to delete year", error: error.message };
      }
    },
    {
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN"]
    }
  )
  .post(
    "/clear-data",
    async ({ set }) => {
      try {
        await OrderService.deleteAll();
        await ClassroomService.clearAllClassrooms();
        set.status = 200;
        return { message: "Successfully cleared all classrooms and orders" };
      } catch (error: any) {
        console.error("Failed to clear data:", error);
        set.status = 500;
        return { message: "Failed to clear data", error: error.message };
      }
    },
    {
      tags: ["Admin"],
      isSignIn: true,
      hasRole: ["SUPERADMIN"]
    }
  );

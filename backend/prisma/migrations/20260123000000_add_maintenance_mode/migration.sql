-- AlterTable
ALTER TABLE "public"."CakeSettings" ADD COLUMN IF NOT EXISTS "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."CakeSettings" ADD COLUMN IF NOT EXISTS "maintenanceMessage" TEXT;


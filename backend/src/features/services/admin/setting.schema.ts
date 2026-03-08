import { t } from "elysia";

export const settingSchema = t.Object({
  academicYear: t.Optional(t.String()),
  currentYear: t.Optional(t.String()),
  pickupStartDate: t.Optional(t.String()), // ISO string
  pickupEndDate: t.Optional(t.String()),   // ISO string
  pickupStartTime: t.Optional(t.String()),
  pickupEndTime: t.Optional(t.String()),
  reporterName: t.Optional(t.String()),
  securityKey: t.Optional(t.String()),
});

export type SettingSchema = typeof settingSchema.static;
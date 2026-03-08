export type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export const Role = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  OFFICER1: "OFFICER1",
  OFFICER2: "OFFICER2",
  USER: "USER",
} as const;

export type Role = typeof Role[keyof typeof Role];

export const RequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

export const OrderStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  COMPLETE: "complete",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const TeamType = {
  TEAM: "team",
  PERSON: "person",
} as const;

export type TeamType = typeof TeamType[keyof typeof TeamType];

export const TimeType = {
  morning: "morning",
  afternoon: "afternoon",
} as const;

export type TimeType = typeof TimeType[keyof typeof TimeType];

export type FormErrors = Record<string, string | undefined>;

export const GradeLevelType = {
  VOCATIONAL: "VOCATIONAL", // ปวช.
  HIGHER: "HIGHER", // ปวส.
} as const;

export type GradeLevelType = typeof GradeLevelType[keyof typeof GradeLevelType];

export interface GradeLevel {
  id: string;
  level: GradeLevelType;
  year: number;
}

import type { Classroom } from "./classroom";
import { GradeLevelType } from "./gradelevel"; // Import GradeLevelType

export interface Year {
  id: string;
  level: GradeLevelType; // Changed to GradeLevelType
  year: number;
  // department_id: string; // Removed as it's not in Prisma's GradeLevel
  classrooms?: Classroom[];
}
import type { Department } from "./department";
import type { GradeLevel } from "./gradelevel";
import type { StudentData } from "../utils/excelParser"; // Use import type for type-only import
import type { Teacher } from "./teacher";

export interface Classroom {
  id: string;
  name: string;
  teacher_id: string;
  department_id: string;
  grade_level_id: string;
  students: StudentData[]; // Updated type
  createdAt: string;
  updatedAt: string;
  department?: Department;
  grade_level?: GradeLevel;
  teacher?: Teacher; // Added optional teacher property
  isOrderFinalized?: boolean; // Added isOrderFinalized property
}

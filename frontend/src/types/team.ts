import { TeamType } from "./common";
import type { Classroom } from "./classroom";
import type { Department } from "./department";
import type { GradeLevel } from "./gradelevel";
import type { Order } from "./order";

export interface Team {
  id: string;
  name: string;
  classroom_ids: string[]; // Array of classroom IDs
  team_type: TeamType;
  student_member_name?: string[];
  total_sales_pounds?: number;
  total_sales_baht?: number;
}

export type Teams = Team[];

export interface CreateTeamDto {
  id?: string;
  name: string;
  classroom_ids: string[];
  team_type: TeamType;
  student_member_name?: string[];
}

export type UpdateTeamDto = Partial<Omit<CreateTeamDto, 'student_member_name'> & { student_member_name?: string[]; }>;

export interface TeamWithRelations extends Team {
  classrooms?: Classroom[];
  departments?: Department[];
  gradeLevels?: GradeLevel[];
  orders?: Pick<Order, "id">[];
}

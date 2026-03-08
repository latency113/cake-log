import { t } from "elysia";

export const TeacherSchema = t.Object({
  id: t.String(),
  name: t.String(),
  department_id: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
export type Teacher = typeof TeacherSchema.static;

export const CreateTeacherDto = t.Object({
  name: t.String(),
  department_id: t.String(),
});
export type CreateTeacherDto = typeof CreateTeacherDto.static;

export const UpdateTeacherDto = t.Partial(CreateTeacherDto);
export type UpdateTeacherDto = typeof UpdateTeacherDto.static;

// Define Department schema
const DepartmentSchema = t.Object({
  id: t.String(),
  name: t.String(),
});

// Define GradeLevel schema
const GradeLevelSchema = t.Object({
  id: t.String(),
  level: t.UnionEnum(["VOCATIONAL", "HIGHER"]),
  year: t.Number(),
});

// Define Teacher Reference schema
const TeacherReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
});

// Define Team Reference schema
const TeamReferenceSchema = t.Object({
  id: t.String(),
});

// Define Order Reference schema
const OrderReferenceSchema = t.Object({
  id: t.String(),
});

// Define Classroom with all relations
const ClassroomSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
  department: DepartmentSchema,
  grade_level: GradeLevelSchema,
  teacher: TeacherReferenceSchema,
  teams: t.Array(TeamReferenceSchema),
  orders: t.Array(OrderReferenceSchema),
});

// Define Teacher with relations
export const TeacherWithRelationsSchema = t.Composite([
  TeacherSchema,
  t.Object({
    classroom: t.Array(ClassroomSchema),
  }),
]);

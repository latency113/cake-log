import { t } from "elysia";

export const TeamSchema = t.Object({
  id: t.String(),
  name: t.String(),
  classroom_ids: t.Array(t.String()),
  team_type: t.UnionEnum(["team", "person"]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  student_member_name: t.Optional(t.Array(t.String())),
  total_sales_pounds: t.Optional(t.Nullable(t.Number())),
  total_sales_baht: t.Optional(t.Nullable(t.Number())),
});

export type Team = typeof TeamSchema.static;

export const CreateTeamDto = t.Object({
  name: t.String(),
  classroom_ids: t.Array(t.String()),
  team_type: t.UnionEnum(["team", "person"]),
  student_member_name: t.Array(t.String()),
});
export type CreateTeamDto = typeof CreateTeamDto.static;
export const UpdateTeamDto = t.Partial(CreateTeamDto);
export type UpdateTeamDto = typeof UpdateTeamDto.static;

// Define reference schemas to avoid circular dependencies
const ClassroomReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
  students: t.Any(),
});

const DepartmentReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
});

const GradeLevelReferenceSchema = t.Object({
  id: t.String(),
  level: t.UnionEnum(["VOCATIONAL", "HIGHER"]),
  year: t.Number(),
});

export const TeamWithRelationsSchema = t.Composite([
  TeamSchema,
  t.Object({
    classrooms: t.Optional(t.Array(ClassroomReferenceSchema)),
    departments: t.Optional(t.Array(DepartmentReferenceSchema)),
    gradeLevels: t.Optional(t.Array(GradeLevelReferenceSchema)),
    orders: t.Optional(
      t.Array(
        t.Object({
          id: t.String(),
        })
      )
    ),
  }),
]);

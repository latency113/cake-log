import { t } from "elysia";

export const DepartmentSchema = t.Object({
  id: t.String(),
  name: t.String(),
});
export type Department = typeof DepartmentSchema.static;

export const CreateDepartmentDto = t.Object({
  name: t.String(),
});
export type CreateDepartmentDto = typeof CreateDepartmentDto.static;

export const UpdateDepartmentDto = t.Partial(CreateDepartmentDto);
export type UpdateDepartmentDto = typeof UpdateDepartmentDto.static;

export const DepartmentWithRelationsSchema = t.Composite([
  DepartmentSchema,
  t.Object({
    classroom: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        teacher_id: t.String(),
        department_id: t.String(),
        grade_level_id: t.String(),
        grade_level: t.Object({
          id: t.String(),
          level: t.UnionEnum(["VOCATIONAL", "HIGHER"]),
          year: t.Number(),
        }),
      })
    ),
    teacher: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
      })
    ),
  }),
]);

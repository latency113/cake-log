import { t } from "elysia";

export const StudentSchema = t.Object({
  studentId: t.String(),
  studentName: t.String(),
});

export const ClassroomSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
  isOrderFinalized: t.Boolean(),
  students: t.Optional(t.Array(StudentSchema)),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Classroom = typeof ClassroomSchema.static;

export const CreateClassroomDto = t.Object({
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
  students: t.Optional(t.Array(StudentSchema)),
});
export type CreateClassroomDto = typeof CreateClassroomDto.static;

export const UpdateClassroomDto = t.Partial(CreateClassroomDto);
export type UpdateClassroomDto = typeof UpdateClassroomDto.static;

// Define the teacher schema with classroom array
const TeacherWithClassroomsSchema = t.Object({
  id: t.String(),
  name: t.String(),
  department_id: t.String(),
});

export const ClassroomWithAllRelationsSchema = t.Composite([
  ClassroomSchema,
  t.Object({
    teacher: TeacherWithClassroomsSchema,
    department: t.Object({
      id: t.String(),
      name: t.String(),
    }),
    grade_level: t.Object({
      id: t.String(),
      level: t.UnionEnum(["VOCATIONAL", "HIGHER"]),
      year: t.Number(),
    }),
    orders: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
  }),
]);

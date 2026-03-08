import prisma from "@/providers/database/database.provider";
import { CreateTeacherDto, UpdateTeacherDto } from "@/features/services/Teacher/Teacher.schema";

export namespace TeacherRepository {
  export async function create(
    teacher: CreateTeacherDto
  ) {
    return prisma.teacher.create({
      data: {
        ...teacher,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where = options.search
      ? {
          name: {
            contains: options.search,
          },
        }
      : {};

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        classroom: {
          include: {
            grade_level: true,
            department: true,
            teacher: true,
            orders: {
              select: {
                id: true
              }
            }
          }
        }
      },
      take: options.take,
      skip: options.skip,
    });

    // Manually fetch teams for each classroom
    const teachersWithTeams = await Promise.all(
      teachers.map(async (teacher) => {
        const classroomsWithTeams = await Promise.all(
          (teacher.classroom || []).map(async (classroom) => {
            const teams = await prisma.team.findMany({
              where: {
                classroom_ids: {
                  has: classroom.id
                }
              },
              select: {
                id: true
              }
            });
            return {
              ...classroom,
              teams,
            };
          })
        );
        return {
          ...teacher,
          classroom: classroomsWithTeams,
        };
      })
    );

    return teachersWithTeams;
  }

  export async function findById(teacherId: string) {
    return await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
      include: {
        classroom: {
          include: {
            grade_level: true,
            department: true,
            teacher: true,
            orders: {
              select: {
                id: true
              }
            }
          }
        }
      },
    });
  }

  export async function update(
    teacherId: string,
    teacher: UpdateTeacherDto
  ) {
    return prisma.teacher.update({
      where: {
        id: teacherId,
      },
      data: {
        ...teacher,
      },
    });
  }

  export async function findByName(name: string) {
    return prisma.teacher.findUnique({
      where: {
        name: name,
      },
    });
  }

  export async function deleteById(teacherId: string) {
    return prisma.teacher.delete({
      where: {
        id: teacherId,
      },
    });
  }

  export async function clearAllTeachers() {
    return prisma.teacher.deleteMany({});
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};
    return await prisma.teacher.count({ where });
  }
}

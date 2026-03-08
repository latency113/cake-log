import prisma from "@/providers/database/database.provider";
import { CreateGradeLevelDto, UpdateGradeLevelDto,  } from "@/features/services/GradeLevel/GradeLevel.schema";

export namespace GradeLevelRepository {
  export async function create(
    GradeLevel: CreateGradeLevelDto
  ) {
    return prisma.gradeLevel.create({
      data: {
        ...GradeLevel,
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
          level: {
            contains: options.search,
            mode: 'insensitive',
          },
        }
      : {};
    return prisma.gradeLevel.findMany({
      where,
      include: {
        classroom: true,
      },
      orderBy:[
        { level: 'desc' },
        { year: 'asc' }
      ],
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(GradeLevelId: string) {
    return await prisma.gradeLevel.findUnique({
      where: {
        id: GradeLevelId,
      },
      include: {
        classroom: true,
      },
    });
  }

  export async function update(
    GradeLevelId: string,
    GradeLevel: UpdateGradeLevelDto
  ) {
    return prisma.gradeLevel.update({
      where: {
        id: GradeLevelId,
      },
      data: {
        ...GradeLevel,
      },
    });
  }

  export async function deleteById(GradeLevelId: string) {
    return prisma.gradeLevel.delete({
      where: {
        id: GradeLevelId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          level: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};
    return await prisma.gradeLevel.count({ where });
  }
}

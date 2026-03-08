import prisma from "@/providers/database/database.provider";
import { CreateDepartmentDto, UpdateDepartmentDto } from "@/features/services/Department/Department.schema";

export namespace DepartmentRepository {
  export async function create(
    department: CreateDepartmentDto
  ) {
    return prisma.department.create({
      data: {
        ...department,
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

    return prisma.department.findMany({
      where,
      include: {
        classroom: {
          include: { grade_level: true },
        },
        teacher: true,
      },
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(departmentId: string) {
    return await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      include: {
        classroom: {
          include: { grade_level: true },
        },
        teacher: true,
      },
    });
  }

  export async function update(
    departmentId: string,
    department: UpdateDepartmentDto
  ) {
    return prisma.department.update({
      where: {
        id: departmentId,
      },
      data: {
        ...department,
      },
    });
  }

  export async function findByName(name: string) {
    return prisma.department.findUnique({
      where: {
        name: name,
      },
    });
  }

  export async function deleteById(departmentId: string) {
    return prisma.department.delete({
      where: {
        id: departmentId,
      },
    });
  }

  export async function clearAllDepartment() {
    return prisma.department.deleteMany({});
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};
    return await prisma.department.count({ where });
  }
}

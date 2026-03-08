import prisma from "@/providers/database/database.provider";
import { CreateUserDto, UpdateUserDto } from "@/features/services/User/User.schema";

export namespace UserRepository {
  export async function create(
    user: CreateUserDto
  ) {
    return prisma.user.create({
      data: {
        ...user,
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
          OR: [
            { username: { contains: options.search } },
            { firstname: { contains: options.search } },
            { lastname: { contains: options.search } },
          ],
        }
      : {};

    return prisma.user.findMany({
      where,
      include:{
        orders:true
      },
      take: options.take,
      skip: options.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  export async function findUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  export async function findById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        teacher: {
          include: {
            classroom: {
              include: {
                department: true,
                grade_level: true,
                orderBooks: {
                  where: { isClosed: false },
                  take: 1
                }
              },
            },
          },
        },
      },
    });
  }

  export async function update(
    userId: string,
    user: UpdateUserDto
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...user,
      },
    });
  }

  export async function deleteById(userId: string) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { firstname: { contains: search } },
            { lastname: { contains: search } },
          ],
        }
      : {};
    return await prisma.user.count({ where });
  }
}

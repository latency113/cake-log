import prisma from "@/providers/database/database.provider";
import { CreateOrderDto, UpdateOrderDto} from "@/features/services/Order/Order.schema";

export namespace OrderRepository {
  export async function create(
    order: CreateOrderDto
  ) {
    return prisma.order.create({
      data: {
        ...order,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            teacher_id: true,
            department_id: true,
            grade_level_id: true,
            isOrderFinalized: true,
          }
        },
        team: true,
        order_items: true,
        book: true,
        officer_prepare: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        officer_pickup: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
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
            {
              customerName: {
                contains: options.search,
              },
            },
            {
              advisor: {
                contains: options.search,
              },
            },
          ],
        }
      : {};

    return prisma.order.findMany({
      where,
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            teacher_id: true,
            department_id: true,
            grade_level_id: true,
            isOrderFinalized: true,
          }
        },
        team: true,
        order_items: true,
        book: true,
        officer_prepare: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        officer_pickup: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
      },
      take: options.take,
      skip: options.skip,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  export async function findById(orderId: string) {
    return await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            teacher_id: true,
            department_id: true,
            grade_level_id: true,
            isOrderFinalized: true,
          }
        },
        team: true,
        order_items: true,
        book: true,
        officer_prepare: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        officer_pickup: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
      },
    });
  }

  export async function update(
    orderId: string,
    order: UpdateOrderDto
  ) {
    return await prisma.order.update({
      where: {
        id: orderId,
      },
      data: order,
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            teacher_id: true,
            department_id: true,
            grade_level_id: true,
            isOrderFinalized: true,
          }
        },
        team: true,
        order_items: true,
        book: true,
        officer_prepare: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        officer_pickup: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
      },
    });
  }

  export async function remove(orderId: string) {
    return await prisma.order.delete({
      where: {
        id: orderId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          OR: [
            {
              customerName: {
                contains: search,
              },
            },
            {
              advisor: {
                contains: search,
              },
            },
          ],
        }
      : {};

    return prisma.order.count({
      where,
    });
  }

  export async function findByOrderNumber(number: string) {
    return prisma.order.findFirst({
      where: {
        number: number,
      },
    });
  }

  export async function findByTeamId(teamId: string) {
    return prisma.order.findMany({
      where: {
        team_id: teamId,
      },
      include: {
        order_items: true,
      },
    });
  }

  export async function deleteAll() {
    return prisma.order.deleteMany({});
  }
}
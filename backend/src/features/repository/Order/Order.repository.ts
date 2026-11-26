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
    classroom_id?: string;
  }) {
    const where: any = {};

    if (options.search) {
      where.OR = [
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
      ];
    }

    if (options.classroom_id) {
      where.classroom_id = options.classroom_id;
    }

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

  export async function countAll(search?: string, classroom_id?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
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
      ];
    }

    if (classroom_id) {
      where.classroom_id = classroom_id;
    }

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

  export async function createEditLog(
    orderId: string,
    editedById: string,
    changes: Record<string, { from: unknown; to: unknown }>
  ) {
    return prisma.orderEditLog.create({
      data: {
        order_id: orderId,
        edited_by_id: editedById,
        changes: changes as object,
      },
      include: {
        edited_by: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });
  }

  export async function findEditLogsByOrderId(orderId: string) {
    return prisma.orderEditLog.findMany({
      where: { order_id: orderId },
      orderBy: { createdAt: "desc" },
      include: {
        edited_by: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });
  }

  export async function findAllEditLogs(
    page: number = 1,
    itemsPerPage: number = 20,
    search?: string
  ) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { order: { number: { contains: search, mode: "insensitive" } } },
        { order: { customerName: { contains: search, mode: "insensitive" } } },
        { edited_by: { firstname: { contains: search, mode: "insensitive" } } },
        { edited_by: { lastname: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.orderEditLog.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
        include: {
          edited_by: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            },
          },
          order: {
            select: {
              id: true,
              number: true,
              customerName: true,
              book: {
                select: {
                  id: true,
                  bookNumber: true,
                },
              },
            },
          },
        },
      }),
      prisma.orderEditLog.count({ where }),
    ]);

    return { data, total };
  }
}
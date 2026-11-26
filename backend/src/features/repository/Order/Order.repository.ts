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

  export interface OrderFindAllFilter {
    search?: string;
    classroom_id?: string;
    user_id?: string;
    department_id?: string;
    pickup_filter?: "today" | "this_week" | "this_month";
  }

  function buildOrderWhere(filter: OrderFindAllFilter) {
    const where: any = {};

    if (filter.search) {
      where.OR = [
        { customerName: { contains: filter.search, mode: "insensitive" } },
        { advisor: { contains: filter.search, mode: "insensitive" } },
        { number: { contains: filter.search, mode: "insensitive" } },
        { phone: { contains: filter.search, mode: "insensitive" } },
        { book: { bookNumber: { contains: filter.search, mode: "insensitive" } } },
      ];
    }

    if (filter.classroom_id) {
      where.classroom_id = filter.classroom_id;
    }

    if (filter.user_id) {
      where.user_id = filter.user_id;
    }

    if (filter.department_id) {
      where.classroom = { department_id: filter.department_id };
    }

    if (filter.pickup_filter) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (filter.pickup_filter === "today") {
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);
        where.pickup_date = { gte: startOfToday, lt: endOfToday };
      } else if (filter.pickup_filter === "this_week") {
        const firstDayOfWeek = new Date(startOfToday);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
        where.pickup_date = { gte: firstDayOfWeek };
      } else if (filter.pickup_filter === "this_month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        where.pickup_date = { gte: startOfMonth, lt: startOfNextMonth };
      }
    }

    return where;
  }

  export async function findAll(
    options: {
      skip: number;
      take: number;
    } & OrderFindAllFilter
  ) {
    const where = buildOrderWhere(options);

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

  export async function countAll(filter: OrderFindAllFilter = {}) {
    const where = buildOrderWhere(filter);

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
import prisma from "@/providers/database/database.provider";
import {
  CreateOrderBookDto,
  UpdateOrderBookDto,
} from "@/features/services/OrderBook/OrderBook.schema";

export namespace OrderBookRepository {
  export async function create(data: CreateOrderBookDto) {
    return prisma.orderBook.create({
      data: {
        bookNumber: data.bookNumber,
        startNumber: data.startNumber ?? "1",
        endNumber: data.endNumber ?? "50",
        maxCapacity: data.maxCapacity ?? 50,
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
            { bookNumber: { contains: options.search } },
            {
              classroom: {
                OR: [
                  { name: { contains: options.search } },
                  {
                    department: {
                      name: { contains: options.search },
                    },
                  },
                ],
              },
            },
          ],
        }
      : {};

    return prisma.orderBook.findMany({
      where,
      include: {
        classroom: {
          include: {
            grade_level: true,
            department: true,
          }
        },
        orders: {
          select: {
            id: true,
            number: true,
          },
        },
      },
      orderBy: {
        bookNumber: "asc",
      },
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(id: string) {
    return prisma.orderBook.findUnique({
      where: { id },
      include: {
        classroom: {
          include: {
            grade_level: true,
            department: true,
          }
        },
        orders: {
            select: {
                id: true,
                number: true,
            },
        },
      },
    });
  }

  export async function findByBookNumber(bookNumber: string) {
    return prisma.orderBook.findUnique({
      where: { bookNumber },
    });
  }

  export async function update(id: string, data: UpdateOrderBookDto) {
    return prisma.orderBook.update({
      where: { id },
      data,
    });
  }

  export async function deleteById(id: string) {
    return prisma.orderBook.delete({
      where: { id },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          OR: [
            { bookNumber: { contains: search } },
            {
              classroom: {
                OR: [
                  { name: { contains: search } },
                  {
                    department: {
                      name: { contains: search },
                    },
                  },
                ],
              },
            },
          ],
        }
      : {};
    return prisma.orderBook.count({ where });
  }

  // Find the first open book that hasn't reached capacity
  export async function findAvailableBook() {
    // This is a bit complex in raw Prisma without raw SQL if we want to compare currentNumber < maxCapacity efficiently in one go
    // But since we store `currentNumber` and `maxCapacity`, we can query it.
    // However, `currentNumber` needs to be maintained accurately.
    return prisma.orderBook.findFirst({
      where: {
        isClosed: false,
        currentNumber: {
          lt: prisma.orderBook.fields.maxCapacity,
        },
      },
      orderBy: {
        bookNumber: "asc",
      },
    });
  }
}

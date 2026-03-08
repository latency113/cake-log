import { OrderRepository } from "@/features/repository/Order/Order.repository";
import { CreateOrderDto, UpdateOrderDto } from "./Order.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { OrderItemRepository } from "@/features/repository/OrderItem/OrderItem.repository";
import { TeamService } from "@/features/services/Team/Team.service";
import prisma from "@/providers/database/database.provider";
export namespace OrderService {
  export async function create(order: CreateOrderDto) {
    if (!order.customerName || order.customerName.trim() === "") {
      throw new Error("Customer name is required and cannot be empty.");
    }
    if (order.totalPrice < 0) {
      throw new Error("Total price cannot be negative.");
    }
    if (order.deposit < 0) {
      throw new Error("Deposit cannot be negative.");
    }
    if (order.deposit > order.totalPrice) {
      throw new Error("Deposit cannot be greater than total price.");
    }

    // Check for duplicate book number and number combination
    const existingOrder = await OrderRepository.findByOrderNumber(
      order.number
    );
    if (existingOrder) {
      throw new Error(`เลขที่นี้ ${order.number} มีอยู่ในระบบแล้ว`);
    }

    // Check if book is full
    const book = await prisma.orderBook.findUnique({
      where: { id: order.book_id },
    });
    if (book && book.currentNumber >= book.maxCapacity) {
      throw new Error(`เล่มที่ ${book.bookNumber} เต็มแล้ว (${book.currentNumber}/${book.maxCapacity})`);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            ...order,
          },
          include: {
            classroom: true,
            team: true,
            order_items: true,
          },
        });

        // Increment book's current number
        await tx.orderBook.update({
          where: { id: order.book_id },
          data: {
            currentNumber: {
              increment: 1,
            },
          },
        });

        return newOrder;
      });

      if (result.team_id) {
        console.log(
          "OrderService.create: Recalculating team sales for team_id:",
          result.team_id
        );
        await TeamService.recalculateTeamSales(result.team_id);
      }

      return {
        ...result,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("เลขที่นี้มีอยู่ในระบบแล้ว");
        }
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const search = options.search;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const orders = await OrderRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await OrderRepository.countAll(search);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    const formattedOrders = orders.map(order => ({
      ...order,
    }));

    return {
      data: formattedOrders,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  export async function findById(orderId: string) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return {
      ...order,
    };
  }

  export async function update(
    orderId: string,
    data: UpdateOrderDto
  ) {
    if (data.totalPrice !== undefined && data.totalPrice < 0) {
      throw new Error("Total price cannot be negative.");
    }
    if (data.deposit !== undefined && data.deposit < 0) {
      throw new Error("Deposit cannot be negative.");
    }

    const existingOrder = await OrderRepository.findById(orderId);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (
      data.deposit !== undefined &&
      data.totalPrice === undefined &&
      data.deposit > existingOrder.totalPrice
    ) {
      throw new Error("Deposit cannot be greater than total price.");
    }
    if (
      data.totalPrice !== undefined &&
      data.deposit === undefined &&
      existingOrder.deposit > data.totalPrice
    ) {
      throw new Error("Total price cannot be less than deposit.");
    }
    if (
      data.totalPrice !== undefined &&
      data.deposit !== undefined &&
      data.deposit > data.totalPrice
    ) {
      throw new Error("Deposit cannot be greater than total price.");
    }

    try {
      const existingOrder = await OrderRepository.findById(orderId);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      const updatedData = {
        ...data,
      };

      const updatedOrder = await OrderRepository.update(orderId, updatedData);

      const oldTeamId = existingOrder.team_id;
      const newTeamId = updatedOrder.team_id;

      if (oldTeamId) {
        console.log(
          "OrderService.update: Recalculating team sales for oldTeamId:",
          oldTeamId
        );
        await TeamService.recalculateTeamSales(oldTeamId);
      }

      if (newTeamId && newTeamId !== oldTeamId) {
        console.log(
          "OrderService.update: Recalculating team sales for newTeamId:",
          newTeamId
        );
        await TeamService.recalculateTeamSales(newTeamId);
      }

      return {
        ...updatedOrder,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Order not found");
        }
        if (error.code === "P2002") {
          throw new Error("Book number and number combination already exists");
        }
      }
      throw error;
    }
  }

  export async function remove(orderId: string) {
    try {
      const orderToDelete = await OrderRepository.findById(orderId);
      if (!orderToDelete) {
        throw new Error("Order not found");
      }

      await prisma.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({
          where: { order_id: orderId },
        });

        await tx.order.delete({
          where: { id: orderId },
        });

        // Decrement book's current number
        await tx.orderBook.update({
          where: { id: orderToDelete.book_id },
          data: {
            currentNumber: {
              decrement: 1,
            },
          },
        });
      });

      if (orderToDelete.team_id) {
        await TeamService.recalculateTeamSales(orderToDelete.team_id);
      }

      return { message: "Order and its items deleted successfully" };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Order not found");
      }
      throw error;
    }
  }

  export async function deleteAll() {
    return prisma.$transaction(async (prisma) => {
      const allOrders = await prisma.order.findMany({ select: { team_id: true } });
      const teamIdsToRecalculate = new Set<string>();

      if (allOrders && Array.isArray(allOrders)) {
        for (const order of allOrders) {
          if (order.team_id) {
            teamIdsToRecalculate.add(order.team_id);
          }
        }
      }

      await prisma.orderItem.deleteMany({});

      await prisma.order.deleteMany({});

      // Reset currentNumber in all OrderBooks
      await prisma.orderBook.updateMany({
        data: {
          currentNumber: 0,
        },
      });

      for (const teamId of teamIdsToRecalculate) {
        await TeamService.recalculateTeamSales(teamId, prisma); 
      }

      return { message: "All orders and their items deleted successfully" };
    });
  }
}

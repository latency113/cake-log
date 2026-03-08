import { OrderItemRepository } from "@/features/repository/OrderItem/OrderItem.repository";
import { CreateOrderItemSchema, UpdateOrderItemSchema } from "./OrderItem.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TeamService } from "@/features/services/Team/Team.service";

export namespace OrderItemService {
  export async function create(orderItem: CreateOrderItemSchema) {
    if (orderItem.pound <= 0) {
      throw new Error('Pound must be greater than 0');
    }
    if (orderItem.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (orderItem.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }

    try {
      const newOrderItem = await OrderItemRepository.create(orderItem);
      if (newOrderItem.order.team_id) {
        await TeamService.recalculateTeamSales(newOrderItem.order.team_id);
      }
      return newOrderItem;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new Error("Referenced order or product does not exist");
        }
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; orderId?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const orderId = options.orderId;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const orderItems = await OrderItemRepository.findAll({
      skip,
      take,
      orderId,
    });
    const total = await OrderItemRepository.countAll(orderId);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: orderItems,
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

  export async function findById(orderItemId: string) {
    const orderItem = await OrderItemRepository.findById(orderItemId);
    if (!orderItem) {
      throw new Error("Order item not found");
    }
    return orderItem;
  }

  export async function findByOrder(orderId: string) {
    return await OrderItemRepository.findByOrder(orderId);
  }

  export async function update(
    orderItemId: string,
    data: UpdateOrderItemSchema
  ) {
    if (data.pound !== undefined && data.pound <= 0) {
      throw new Error('Pound must be greater than 0');
    }
    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (data.unitPrice !== undefined && data.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }

    const existingOrderItem = await OrderItemRepository.findById(orderItemId);
    if (!existingOrderItem) {
      throw new Error("Order item not found");
    }

    try {
      const updatedOrderItem = await OrderItemRepository.update(orderItemId, data);
      if (updatedOrderItem.order.team_id) {
        await TeamService.recalculateTeamSales(updatedOrderItem.order.team_id);
      }
      return updatedOrderItem;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new Error("Referenced order or product does not exist");
        }
      }
      throw error;
    }
  }

  export async function remove(orderItemId: string) {
    const existingOrderItem = await OrderItemRepository.findById(orderItemId);
    if (!existingOrderItem) {
      throw new Error("Order item not found");
    }

    const teamId = existingOrderItem.order.team_id;

    const removedOrderItem = await OrderItemRepository.remove(orderItemId);

    if (teamId) {
      await TeamService.recalculateTeamSales(teamId);
    }

    return removedOrderItem;
  }
}

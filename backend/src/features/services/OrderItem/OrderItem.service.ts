import { OrderItemRepository } from "@/features/repository/OrderItem/OrderItem.repository";
import { OrderRepository } from "@/features/repository/Order/Order.repository";
import { CreateOrderItemSchema, UpdateOrderItemSchema } from "./OrderItem.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TeamService } from "@/features/services/Team/Team.service";

export namespace OrderItemService {
  export async function create(orderItem: CreateOrderItemSchema, editedById?: string) {
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
      // Log only when adding an item to an existing order (avoid logging initial creation items)
      const orderAgeMs = Date.now() - new Date(newOrderItem.order.createdAt).getTime();
      if (editedById && orderAgeMs > 5000) {
        const label = `${newOrderItem.product.name} (${newOrderItem.pound} ปอนด์)`;
        await OrderRepository.createEditLog(newOrderItem.order_id, editedById, {
          [label]: { from: 0, to: newOrderItem.quantity },
        });
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
    const [orderItems, total] = await Promise.all([
      OrderItemRepository.findAll({
        skip,
        take,
        orderId,
      }),
      OrderItemRepository.countAll(orderId),
    ]);

    return buildPaginatedResponse(orderItems, total, page, itemsPerPage);
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
    data: UpdateOrderItemSchema,
    editedById?: string
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
      if (editedById) {
        const oldLabel = `${existingOrderItem.product.name} (${existingOrderItem.pound} ปอนด์)`;
        const newLabel = `${updatedOrderItem.product.name} (${updatedOrderItem.pound} ปอนด์)`;
        const changes: Record<string, { from: unknown; to: unknown }> = {};
        if (oldLabel === newLabel) {
          if (existingOrderItem.quantity !== updatedOrderItem.quantity) {
            changes[oldLabel] = {
              from: existingOrderItem.quantity,
              to: updatedOrderItem.quantity,
            };
          }
        } else {
          changes[oldLabel] = { from: existingOrderItem.quantity, to: 0 };
          changes[newLabel] = { from: 0, to: updatedOrderItem.quantity };
        }
        if (Object.keys(changes).length > 0) {
          await OrderRepository.createEditLog(updatedOrderItem.order_id, editedById, changes);
        }
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

  export async function remove(orderItemId: string, editedById?: string) {
    const existingOrderItem = await OrderItemRepository.findById(orderItemId);
    if (!existingOrderItem) {
      throw new Error("Order item not found");
    }

    const teamId = existingOrderItem.order.team_id;

    const removedOrderItem = await OrderItemRepository.remove(orderItemId);

    if (editedById) {
      const label = `${existingOrderItem.product.name} (${existingOrderItem.pound} ปอนด์)`;
      await OrderRepository.createEditLog(existingOrderItem.order_id, editedById, {
        [label]: { from: existingOrderItem.quantity, to: 0 },
      });
    }

    if (teamId) {
      await TeamService.recalculateTeamSales(teamId);
    }

    return removedOrderItem;
  }
}

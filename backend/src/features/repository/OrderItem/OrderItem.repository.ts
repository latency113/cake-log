import { CreateOrderItemSchema, UpdateOrderItemSchema } from './../../services/OrderItem/OrderItem.schema';
import prisma from "@/providers/database/database.provider";

export namespace OrderItemRepository {
  export async function create(orderItem: typeof CreateOrderItemSchema) {
    const product = await prisma.product.findUnique({
      where: { id: orderItem.product_id },
      select: { price: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const subtotal = product.price * orderItem.pound * orderItem.quantity;

    return prisma.orderItem.create({
      data: {
        ...orderItem,
        subtotal,
      },
      include: {
        product: true,
        order: true,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    orderId?: string;
  }) {
    const { skip, take, orderId } = options;
    const where = orderId ? { order_id: orderId } : undefined;

    return prisma.orderItem.findMany({
      where,
      include: {
        product: true,
        order: true,
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  export async function findById(orderItemId: string) {
    return await prisma.orderItem.findUnique({
      where: {
        id: orderItemId,
      },
      include: {
        product: true,
        order: true,
      },
    });
  }

  export async function update(
    orderItemId: string,
    orderItem: typeof UpdateOrderItemSchema
  ) {
    let subtotalUpdate = {};

    if (orderItem.pound !== undefined || orderItem.quantity !== undefined || orderItem.product_id !== undefined) {
      const currentOrderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { product: true },
      });

      if (!currentOrderItem) {
        throw new Error("Order item not found");
      }

      const productId = orderItem.product_id || currentOrderItem.product_id;
      const product = productId !== currentOrderItem.product_id
        ? await prisma.product.findUnique({ where: { id: productId } })
        : currentOrderItem.product;

      if (!product) {
        throw new Error("Product not found");
      }

      const pound = orderItem.pound ?? currentOrderItem.pound;
      const quantity = orderItem.quantity ?? currentOrderItem.quantity;
      const subtotal = product.price * pound * quantity;

      subtotalUpdate = { subtotal };
    }

    return await prisma.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: {
        ...orderItem,
        ...subtotalUpdate,
      },
      include: {
        product: true,
        order: true,
      },
    });
  }

  export async function remove(orderItemId: string) {
    return await prisma.orderItem.delete({
      where: {
        id: orderItemId,
      },
    });
  }

  export async function removeByOrderId(orderId: string) {
    return await prisma.orderItem.deleteMany({
      where: {
        order_id: orderId,
      },
    });
  }

  export async function countAll(orderId?: string) {
    const where = orderId ? { order_id: orderId } : undefined;
    return await prisma.orderItem.count({ where });
  }

  export async function findByOrder(orderId: string) {
    return await prisma.orderItem.findMany({
      where: {
        order_id: orderId,
      },
      include: {
        product: true,
        order: true,
      },
    });
  }

  export async function deleteAll() {
    return await prisma.orderItem.deleteMany({});
  }
}
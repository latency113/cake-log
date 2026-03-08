import Elysia, { t } from "elysia";
import { OrderItemService } from "../../services/OrderItem/OrderItem.service";
import {
  OrderItemWithRelationsSchema,
  CreateOrderItemSchema,
  UpdateOrderItemSchema,
} from "../../services/OrderItem/OrderItem.schema";
import { auth } from "@/shared/middleware/auth";

export namespace OrderItemController {
  export const orderItemController = new Elysia({ prefix: "/order-items" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newOrderItem = await OrderItemService.create(body);
          set.status = 201;
          return { newOrderItem, message: "Order item has been created" };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes("does not exist")) {
              set.status = 404;
              return error.message;
            }
            if (error.message.includes("must be") || error.message.includes("cannot be")) {
              set.status = 400;
              return error.message;
            }
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        body: CreateOrderItemSchema,
        response: {
          201: t.Object({
            newOrderItem: OrderItemWithRelationsSchema,
            message: t.String(),
          }),
          400: t.String(),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Order Items"],
        isSignIn: true
      }
    )
    .get(
      "/",
      async ({ query, set }) => {
        const page = query.page ? Number(query.page) : 1;
        const itemsPerPage = query.itemsPerPage
          ? Number(query.itemsPerPage)
          : 10;
        const orderId = query.orderId;

        const result = await OrderItemService.findAll({
          page,
          itemsPerPage,
          orderId,
        });

        if (result.data.length === 0 && orderId !== undefined) {
          set.status = "Not Found";
          return {
            message: "No order items found for the specified order.",
          };
        }

        return result;
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric()),
          itemsPerPage: t.Optional(t.Numeric()),
          orderId: t.Optional(t.String()),
        }),
        response: {
          200: t.Object({
            data: t.Array(OrderItemWithRelationsSchema),
            meta_data: t.Object({
              page: t.Number(),
              itemsPerPage: t.Number(),
              total: t.Number(),
              totalPages: t.Number(),
              nextPage: t.Boolean(),
              previousPage: t.Boolean(),
            }),
          }),
          404: t.Object({
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Order Items"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN", "OFFICER1", "OFFICER2"]
      }
    )
    .get(
      "/:orderItemId",
      async ({ params: { orderItemId }, set }) => {
        try {
          const orderItem = await OrderItemService.findById(orderItemId);
          return orderItem;
        } catch (error) {
          if (error instanceof Error) {
            set.status = 404;
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderItemId: t.String(),
        }),
        response: {
          200: OrderItemWithRelationsSchema,
          404: t.String(),
          500: t.String(),
        },
        tags: ["Order Items"],
        isSignIn: true
      }
    )
    .get(
      "/order/:orderId",
      async ({ params: { orderId }, set }) => {
        try {
          const orderItems = await OrderItemService.findByOrder(orderId);
          if (orderItems.length === 0) {
            set.status = 404;
            return "No order items found for this order";
          }
          return orderItems;
        } catch {
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderId: t.String(),
        }),
        response: {
          200: t.Array(OrderItemWithRelationsSchema),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Order Items"],
        isSignIn: true
      }
    )
    .put(
      "/:orderItemId",
      async ({ params: { orderItemId }, body, set }) => {
        try {
          const updatedOrderItem = await OrderItemService.update(orderItemId, body);
          return { updatedOrderItem, message: "Order item has been updated" };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes("not found")) {
              set.status = 404;
              return error.message;
            }
            if (error.message.includes("must be") || error.message.includes("cannot be")) {
              set.status = 400;
              return error.message;
            }
            if (error.message.includes("does not exist")) {
              set.status = 404;
              return error.message;
            }
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderItemId: t.String(),
        }),
        body: UpdateOrderItemSchema,
        response: {
          200: t.Object({
            updatedOrderItem: OrderItemWithRelationsSchema,
            message: t.String(),
          }),
          400: t.String(),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Order Items"],
        isSignIn: true
      }
    )
    .delete(
      "/:orderItemId",
      async ({ params: { orderItemId }, set }) => {
        try {
          await OrderItemService.remove(orderItemId);
          return { message: "Order item has been deleted" };
        } catch (error) {
          if (error instanceof Error) {
            set.status = 404;
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderItemId: t.String(),
        }),
        response: {
          200: t.Object({
            message: t.String(),
          }),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Order Items"],
        isSignIn: true
      }
    );
}
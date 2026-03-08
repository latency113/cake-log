import Elysia, { t } from "elysia";
import { CreateOrderDto, OrderSchema, OrderWithRelationsSchema, UpdateOrderDto } from "../../services/Order/Order.schema";
import { OrderService } from "../../services/Order/Order.service";
import { auth } from "@/shared/middleware/auth";

export namespace OrderController {
  export const orderController = new Elysia({ prefix: "/orders" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newOrder = await OrderService.create(body);
          set.status = 201;
          return { newOrder, message: "Order has been created" };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes("already exists")) {
              set.status = "Conflict";
              return error.message;
            }
            if (error.message.includes("cannot be")) {
              set.status = 400;
              return error.message;
            }
          }
          set.status = "Internal Server Error";
          return error;
        }
      },
      {
        body: CreateOrderDto,
        response: {
          201: t.Object({
            newOrder: OrderWithRelationsSchema,
            message: t.String(),
          }),
          400: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Orders"],
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
        const search = query.search;

        const result = await OrderService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No order found matching your search query.",
          };
        }

        return result;
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric()),
          itemsPerPage: t.Optional(t.Numeric()),
          search: t.Optional(t.String()),
        }),
        response: {
          200: t.Object({
            data: t.Array(OrderWithRelationsSchema),
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
        tags: ["Orders"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN", "OFFICER1", "OFFICER2"]
      }
    )
    .get(
      "/:orderId",
      async ({ params: { orderId }, set }) => {
        try {
          const order = await OrderService.findById(orderId);
          return order;
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "Order not found") {
              set.status = "Not Found";
              return error.message;
            }
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderId: t.String(),
        }),
        response: {
          200: OrderWithRelationsSchema,
          404: t.String(),
          500: t.String(),
        },
        tags: ["Orders"],
        isSignIn: true
      }
    )
    .patch(
      "/:orderId",
      async ({ params: { orderId }, body, set }) => {
        try {
          const updatedOrder = await OrderService.update(orderId, body);
          return { updatedOrder, message: "Order has been updated" };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "Order not found") {
              set.status = "Not Found";
              return error.message;
            }
            if (error.message.includes("already exists")) {
              set.status = "Conflict";
              return error.message;
            }
            if (error.message.includes("cannot be")) {
              set.status = 400;
              return error.message;
            }
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderId: t.String(),
        }),
        body: UpdateOrderDto,
        response: {
          200: t.Object({
            updatedOrder: OrderWithRelationsSchema,
            message: t.String(),
          }),
          400: t.String(),
          404: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Orders"],
        isSignIn: true
      }
    )
    .delete(
      "/:orderId",
      async ({ params: { orderId }, set }) => {
        try {
          await OrderService.remove(orderId);
          return { message: "Order has been deleted" };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "Order not found") {
              set.status = "Not Found";
              return error.message;
            }
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          orderId: t.String(),
        }),
        response: {
          200: t.Object({
            message: t.String(),
          }),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Orders"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN", "OFFICER1", "OFFICER2"]
      }
    )
    .delete(
      "/all",
      async ({ set }) => {
        try {
          await OrderService.deleteAll();
          set.status = 200;
          return { message: "All orders have been deleted" };
        } catch (error) {
          if (error instanceof Error) {
            set.status = "Internal Server Error";
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        response: {
          200: t.Object({
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Orders"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    );
}
import Elysia, { t } from "elysia";
import {
  CreateOrderBookDto,
  OrderBookSchema,
  OrderBookWithRelationsSchema,
  UpdateOrderBookDto,
} from "../../services/OrderBook/OrderBook.schema";
import { OrderBookService } from "../../services/OrderBook/OrderBook.service";
import { auth } from "@/shared/middleware/auth";

export namespace OrderBookController {
  export const orderBookController = new Elysia({ prefix: "/order-books" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newBook = await OrderBookService.create(body);
          set.status = 201;
          return { newBook, message: "OrderBook has been created" };
        } catch (error: any) {
          if (error.message === "Book number already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        body: CreateOrderBookDto,
        response: {
          201: t.Object({
            newBook: OrderBookSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["OrderBooks"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
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

        const result = await OrderBookService.findAll({
          page,
          itemsPerPage,
          search,
        });

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
            data: t.Array(OrderBookWithRelationsSchema),
            meta_data: t.Object({
              page: t.Number(),
              itemsPerPage: t.Number(),
              total: t.Number(),
              totalPages: t.Number(),
              nextPage: t.Boolean(),
              previousPage: t.Boolean(),
            }),
          }),
          404: t.Object({ message: t.String() }),
          500: t.String(),
        },
        tags: ["OrderBooks"],
        isSignIn: true
      }
    )
    .get(
      "/available",
      async ({ set }) => {
        try {
          const book = await OrderBookService.findAvailableBook();
          if (!book) {
            set.status = "Not Found";
            return { message: "No available OrderBook found" };
          }
          return book;
        } catch (error: any) {
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        response: {
          200: OrderBookSchema,
          404: t.Object({ message: t.String() }),
          500: t.String(),
        },
        tags: ["OrderBooks"],
        isSignIn: true
      }
    )
    .get(
      "/:id",
      async ({ params: { id }, set }) => {
        try {
          const book = await OrderBookService.findById(id);
          return book;
        } catch (error: any) {
          if (error.message === "OrderBook not found") {
            set.status = "Not Found";
            return error.message;
          }
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ id: t.String() }),
        response: {
          200: OrderBookWithRelationsSchema,
          404: t.String(),
          500: t.String(),
        },
        tags: ["OrderBooks"],
        isSignIn: true
      }
    )
    .patch(
      "/:id",
      async ({ params: { id }, body, set }) => {
        try {
          const updatedBook = await OrderBookService.update(id, body);
          return { updatedBook, message: "OrderBook has been updated" };
        } catch (error: any) {
          if (error.message === "OrderBook not found") {
            set.status = "Not Found";
            return error.message;
          }
          if (error.message === "Book number already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ id: t.String() }),
        body: UpdateOrderBookDto,
        response: {
          200: t.Object({
            updatedBook: OrderBookSchema,
            message: t.String(),
          }),
          404: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["OrderBooks"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .patch(
      "/:id/assign",
      async ({ params: { id }, body, set }) => {
        try {
          const { classroom_id } = body;
          const updatedBook = await OrderBookService.update(id, { classroom_id });
          return { updatedBook, message: "OrderBook assigned successfully" };
        } catch (error: any) {
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ id: t.String() }),
        body: t.Object({ 
          classroom_id: t.String(),
        }),
        tags: ["OrderBooks"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:id",
      async ({ params: { id }, set }) => {
        try {
          await OrderBookService.deleteById(id);
          return { message: "OrderBook has been deleted" };
        } catch (error: any) {
          if (error.message === "OrderBook not found") {
            set.status = "Not Found";
            return error.message;
          }
          set.status = "Internal Server Error";
          return error.message || "Internal Server Error";
        }
      },
      {
        params: t.Object({ id: t.String() }),
        response: {
          200: t.Object({ message: t.String() }),
          404: t.String(),
          500: t.String(),
        },
        tags: ["OrderBooks"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    );
}

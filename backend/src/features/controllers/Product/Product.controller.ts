import Elysia, { t } from "elysia";
import { CreateProductDto, ProductSchema, ProductWithRelationsSchema, UpdateProductDto } from "../../services/Product/Product.schema";
import { ProductService } from "../../services/Product/Product.service";
import { auth } from "@/shared/middleware/auth";

export namespace ProductController {
  export const productController = new Elysia({ prefix: "/products" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newProduct = await ProductService.create(body);
          set.status = 201;
          return { newProduct, message: "Product has been created" };
        } catch (error: any) {
          if (error.message === "Product name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          if (error.message.includes("price")) {
            set.status = 400;
            return error.message;
          }
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: CreateProductDto,
        response: {
          201: t.Object({
            newProduct: ProductSchema,
            message: t.String(),
          }),
          400: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Products"],
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

        const result = await ProductService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No product found matching your search query.",
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
            data: t.Array(ProductWithRelationsSchema),
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
        tags: ["Products"],
        isSignIn: true
      }
    )
    .get(
      "/:productId",
      async ({ params: { productId }, set }) => {
        try {
          const product = await ProductService.findById(productId);
          return product;
        } catch (error: any) {
          if (error.message === "Product not found") {
            set.status = "Not Found";
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          productId: t.String(),
        }),
        response: {
          200: ProductWithRelationsSchema,
          404: t.String(),
          500: t.String(),
        },
        tags: ["Products"],
        isSignIn: true
      }
    )
    .put(
      "/:productId",
      async ({ params: { productId }, body, set }) => {
        try {
          const updatedProduct = await ProductService.update(productId, body);
          return { updatedProduct, message: "Product has been updated" };
        } catch (error: any) {
          if (error.message === "Product not found") {
            set.status = "Not Found";
            return error.message;
          }
          if (error.message === "Product name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          if (error.message.includes("price")) {
            set.status = 400;
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          productId: t.String(),
        }),
        body: UpdateProductDto,
        response: {
          200: t.Object({
            updatedProduct: ProductSchema,
            message: t.String(),
          }),
          400: t.String(),
          404: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Products"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:productId",
      async ({ params: { productId }, set }) => {
        try {
          await ProductService.remove(productId);
          return { message: "Product has been deleted" };
        } catch (error: any) {
          if (error.message === "Product not found") {
            set.status = "Not Found";
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          productId: t.String(),
        }),
        response: {
          200: t.Object({
            message: t.String(),
          }),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Products"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    );
}
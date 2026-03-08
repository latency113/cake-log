import { t } from "elysia";

export const ProductSchema = t.Object({
  id: t.String(),
  name: t.String(),
  price: t.Number(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Product = typeof ProductSchema.static;

export const CreateProductDto = t.Object({
  name: t.String(),
  price: t.Number(),
});
export type CreateProductDto = typeof CreateProductDto.static;

export const UpdateProductDto = t.Partial(CreateProductDto);
export type UpdateProductDto = typeof UpdateProductDto.static;

// Define OrderItem reference schema
const OrderItemReferenceSchema = t.Object({
  id: t.String(),
  quantity: t.Number(),
  order_id: t.String(),
  product_id: t.String(),
});

export const ProductWithRelationsSchema = t.Composite([
  ProductSchema,
  t.Object({
    orderItems: t.Array(OrderItemReferenceSchema),
  }),
]);

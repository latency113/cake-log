import { t } from "elysia";

export const OrderItemSchema = t.Object({
  id: t.String(),
  order_id: t.String(),
  product_id: t.String(),
  pound: t.Number(),
  quantity: t.Number(),
  unitPrice: t.Number(),
  subtotal: t.Number(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type OrderItem = typeof OrderItemSchema.static;

// Reference schemas to avoid circular dependencies
const ProductReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  price: t.Number(),
  description: t.Optional(t.String()),
});

const OrderReferenceSchema = t.Object({
  id: t.String(),
  customerName: t.String(),
  classroom_id: t.Optional(t.String()),
  team_id: t.Optional(t.Nullable(t.String())),
  orderDate: t.Date(),
  totalPrice: t.Number(),
  book_id: t.String(),
  number: t.String(),
  phone: t.String(),
  pickup_date: t.Date(),
  deposit: t.Number(),
  advisor: t.String(),
  status: t.UnionEnum(["pending", "complete", "cancelled"]),
});

export const OrderItemWithRelationsSchema = t.Composite([
  OrderItemSchema,
  t.Object({
    product: ProductReferenceSchema,
    order: OrderReferenceSchema,
  }),
]);

export const CreateOrderItemSchema = t.Omit(OrderItemSchema, [
  "id",
  "createdAt",
  "updatedAt",
  "subtotal",
]);

export const UpdateOrderItemSchema = t.Partial(
  t.Omit(OrderItemSchema, ["id", "createdAt", "updatedAt"])
);

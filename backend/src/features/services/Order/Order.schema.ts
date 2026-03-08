import { t } from "elysia";
export const OrderSchema = t.Object({
  id: t.String(),
  user_id: t.String(),
  officer_prepare_id: t.Optional(t.Nullable(t.String())),
  officer_pickup_id: t.Optional(t.Nullable(t.String())),
  customerName: t.String(),
  classroom_id: t.Optional(t.Nullable(t.String())),
  team_id: t.Optional(t.Nullable(t.String())),
  orderDate: t.Date(),
  totalPrice: t.Number(),
  book_id: t.String(),
  number: t.String(),
  phone: t.String(),
  pickup_date: t.Date(),
  picked_up_at: t.Optional(t.Nullable(t.Date())),
  time_type: t.UnionEnum(["morning", "afternoon"]),
  deposit: t.Number(),
  advisor: t.String(),
  status: t.UnionEnum(["pending", "complete", "cancelled", "approved"]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

// user_id            String  @db.ObjectId
// officer_prepare_id String? @db.ObjectId
// officer_pickup_id  String? @db.ObjectId

export type Order = typeof OrderSchema.static;

export const CreateOrderDto = t.Object({
  user_id: t.String(),
  officer_prepare_id: t.Optional(t.Nullable(t.String())),
  officer_pickup_id: t.Optional(t.Nullable(t.String())),
  customerName: t.String(),
  classroom_id: t.Optional(t.Nullable(t.String())),
  team_id: t.Optional(t.Nullable(t.String())),
  orderDate: t.Date(),
  totalPrice: t.Number(),
  book_id: t.String(),
  number: t.String(),
  phone: t.String(),
  pickup_date: t.Date(),
  picked_up_at: t.Optional(t.Nullable(t.Date())),
  time_type: t.UnionEnum(["morning", "afternoon"]),
  deposit: t.Number(),
  advisor: t.String(),
  status: t.Optional(
    t.UnionEnum(["pending", "complete", "cancelled", "approved"])
  ),
});
export type CreateOrderDto = typeof CreateOrderDto.static;

export const UpdateOrderDto = t.Partial(CreateOrderDto);
export type UpdateOrderDto = typeof UpdateOrderDto.static;

// Reference schemas to avoid circular dependencies
const ClassroomReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.Optional(t.Nullable(t.String())),
  isOrderFinalized: t.Optional(t.Boolean()),
});

const TeamReferenceSchema = t.Object({
  id: t.Optional(t.String()),
  name: t.Optional(t.String()),
  classroom_id: t.Optional(t.String()),
});

const OrderItemReferenceSchema = t.Object({
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

const UserSmallSchema = t.Object({
  id: t.String(),
  firstname: t.String(),
  lastname: t.String(),
});

export const OrderWithRelationsSchema = t.Composite([
  OrderSchema,
  t.Object({
    classroom: t.Optional(t.Nullable(ClassroomReferenceSchema)),
    team: t.Optional(t.Nullable(TeamReferenceSchema)),
    order_items: t.Array(OrderItemReferenceSchema),
    book: t.Optional(t.Nullable(t.Object({
      id: t.String(),
      bookNumber: t.String(),
    }))),
    officer_prepare: t.Optional(t.Nullable(UserSmallSchema)),
    officer_pickup: t.Optional(t.Nullable(UserSmallSchema)),
    user: t.Optional(t.Nullable(UserSmallSchema)),
  }),
]);

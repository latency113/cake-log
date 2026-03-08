import { t } from "elysia";

export const OrderBookSchema = t.Object({
  id: t.String(),
  bookNumber: t.String(),
  startNumber: t.String(),
  endNumber: t.String(),
  currentNumber: t.Number(),
  maxCapacity: t.Number(),
  isClosed: t.Boolean(),
  classroom_id: t.Optional(t.Nullable(t.String())),
  createdAt: t.Optional(t.Date()), // Optional because it might not be in the model if I misread, checking schema again... wait, it's not in schema.prisma for OrderBook!
  // Schema check: OrderBook does NOT have createdAt/updatedAt in the schema.prisma I read above.
  // "model OrderBook { ... }" - no createdAt/updatedAt.
});

export type OrderBook = typeof OrderBookSchema.static;

export const CreateOrderBookDto = t.Object({
  bookNumber: t.String(),
  startNumber: t.Optional(t.String()),
  endNumber: t.Optional(t.String()),
  maxCapacity: t.Optional(t.Number()), // Default 50
});
export type CreateOrderBookDto = typeof CreateOrderBookDto.static;

export const UpdateOrderBookDto = t.Partial(
  t.Object({
    bookNumber: t.String(),
    startNumber: t.String(),
    endNumber: t.String(),
    currentNumber: t.Number(),
    maxCapacity: t.Number(),
    isClosed: t.Boolean(),
    classroom_id: t.Nullable(t.String()),
  })
);
export type UpdateOrderBookDto = typeof UpdateOrderBookDto.static;

export const OrderBookWithRelationsSchema = t.Composite([
  OrderBookSchema,
  t.Object({
    classroom: t.Optional(t.Nullable(t.Object({
      id: t.String(),
      name: t.String(),
      grade_level: t.Optional(t.Object({
        id: t.String(),
        level: t.String(),
        year: t.Number(),
      })),
      department: t.Optional(t.Object({
        id: t.String(),
        name: t.String(),
      })),
    }))),
    orders: t.Array(
      t.Object({
        id: t.String(),
        number: t.String(),
      })
    ),
  }),
]);

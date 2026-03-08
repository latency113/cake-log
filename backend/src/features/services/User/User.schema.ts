import { t } from "elysia";
import { OrderSchema } from "../Order/Order.schema";

export const UserSchema = t.Object({
  id: t.String(),
  firstname: t.String(),
  lastname: t.String(),
  username: t.String(),
  password: t.String(),
  email: t.Optional(t.Union([t.String(), t.Null()])),
  role: t.UnionEnum(["SUPERADMIN","ADMIN","OFFICER1","USER","OFFICER2"]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  orders: t.Optional(t.Array(OrderSchema)),
  teacher_id: t.Optional(t.Nullable(t.String())),
  teacher: t.Optional(t.Any()), // Using Any for simplicity to avoid circular imports, but containing classroom info
});

export type User = typeof UserSchema.static;

export const CreateUserDto = t.Object({
  firstname: t.String(),
  lastname: t.String(),
  username: t.String(),
  password: t.String(),
  email: t.Optional(t.Union([t.String(), t.Null()])),
  role: t.UnionEnum(["SUPERADMIN","ADMIN","OFFICER1","USER","OFFICER2"]),
  teacher_id: t.Optional(t.String()),
});
export type CreateUserDto = typeof CreateUserDto.static;

export const UpdateUserDto = t.Partial(CreateUserDto);
export type UpdateUserDto = typeof UpdateUserDto.static;

//   id        String  @id @default(auto()) @map("_id") @db.ObjectId
//   firstname String
//   lastname  String
//   username  String  @unique
//   password  String
//   email     String?
// //   role      Role    @default(USER)
//   createdAt   DateTime      @default(now())
//   updatedAt   DateTime      @updatedAt
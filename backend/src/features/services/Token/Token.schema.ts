import { t } from "elysia";
import { UserSchema } from "../User/User.schema";

export const TokenSchema = t.Object({
  id: t.String(),
  token: t.String(),
  user_id: t.String(),
  expires_at: t.Date(),
  created_at: t.Date(),
  updated_at: t.Date(),
});

export type Token = typeof TokenSchema.static;

export const CreateTokenDto = t.Object({
  user_id: t.String(),
  expires_in: t.Optional(t.Number()), // in days
});
export type CreateTokenDto = typeof CreateTokenDto.static;

export const VerifyTokenDto = t.Object({
  token: t.String(),
});
export type VerifyTokenDto = typeof VerifyTokenDto.static;

export const TokenWithRelationsSchema = t.Composite([
  TokenSchema,
  t.Object({
    user: UserSchema,
  }),
]);
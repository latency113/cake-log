import { TokenRepository } from "../../repository/Token/token.repository";
import { CreateTokenDto, VerifyTokenDto } from "./Token.schema";

export namespace TokenService {
  export async function generateToken(data: CreateTokenDto) {
    try {
      const token = Bun.randomUUIDv7();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (data.expires_in ?? 30));
      const tokenData = {
        token,
        user_id: data.user_id,
        expires_at: expiresAt,
      };
      return await TokenRepository.create(tokenData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate token"
      );
    }
  }

  export async function verifyToken(data: VerifyTokenDto) {
    try {
      const tokenRecord = await TokenRepository.findByToken(data.token);

      if (!tokenRecord) {
        return null;
      }

      if (tokenRecord.expires_at < new Date()) {
        await TokenRepository.removeToken(data.token);
        return null;
      }

      return tokenRecord;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to verify token"
      );
    }
  }

  export async function getUserTokens(userId: string) {
    try {
      return await TokenRepository.findByUserId(userId);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to get user tokens"
      );
    }
  }

  export async function revokeToken(data: VerifyTokenDto) {
    try {
      return await TokenRepository.removeToken(data.token);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to revoke token"
      );
    }
  }

  export async function revokeAllUserTokens(userId: string) {
    try {
      return await TokenRepository.deleteAllUserTokens(userId);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to revoke user tokens"
      );
    }
  }

  export async function cleanupExpiredTokens() {
    try {
      return await TokenRepository.deleteExpired();
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to cleanup expired tokens"
      );
    }
  }
}

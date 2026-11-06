import { UserRepository } from "@/features/repository/User/user.repository";
import { CreateUserDto, UserSchema, UpdateUserDto } from "./User.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TokenService } from "../Token/Token.service";
import { getAllDatabaseClients } from "@/providers/database/connection-manager";
import prisma from "@/providers/database/database.provider";

type JWTInstance = {
  sign: (payload: Record<string, unknown>) => Promise<string>;
};

async function syncUpdateAcrossAllDatabases(
  username: string,
  data: {
    firstname?: string;
    lastname?: string;
    password?: string;
    email?: string | null;
  }
) {
  try {
    const clients = await getAllDatabaseClients();
    const updatePayload: Record<string, any> = {};
    if (data.password) updatePayload.password = data.password;
    if (data.firstname) updatePayload.firstname = data.firstname;
    if (data.lastname) updatePayload.lastname = data.lastname;
    if (data.email !== undefined) updatePayload.email = data.email;

    if (Object.keys(updatePayload).length === 0) return;

    for (const client of clients) {
      try {
        await client.user.updateMany({
          where: { username },
          data: updatePayload,
        });
      } catch (err) {
        console.error(`[UserService] Error syncing user update for ${username}:`, err);
      }
    }
  } catch (error) {
    console.error(`[UserService] Failed to sync user update across databases:`, error);
  }
}

async function syncCreateAcrossAllDatabases(
  user: {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email?: string | null;
    role: any;
    teacher_id?: string | null;
  },
  hashPassword: string
) {
  try {
    const clients = await getAllDatabaseClients();
    for (const client of clients) {
      try {
        const existing = await client.user.findUnique({
          where: { username: user.username },
        });
        if (!existing) {
          let teacherId: string | null = null;
          if (user.teacher_id) {
            const teacherExists = await client.teacher.findUnique({
              where: { id: user.teacher_id },
            });
            if (teacherExists) {
              teacherId = user.teacher_id;
            }
          }

          await client.user.create({
            data: {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              username: user.username,
              password: hashPassword,
              email: user.email,
              role: user.role,
              teacher_id: teacherId,
            },
          });
        }
      } catch (err) {
        console.error(`[UserService] Error syncing user create for ${user.username}:`, err);
      }
    }
  } catch (error) {
    console.error(`[UserService] Failed to sync user create across databases:`, error);
  }
}

async function syncDeleteAcrossAllDatabases(username: string) {
  try {
    const clients = await getAllDatabaseClients();
    for (const client of clients) {
      try {
        const u = await client.user.findUnique({
          where: { username },
          select: { id: true },
        });
        if (u) {
          await client.token.deleteMany({
            where: { user_id: u.id },
          });
          await client.user.deleteMany({
            where: { username },
          });
        }
      } catch (err) {
        console.error(`[UserService] Error syncing user delete for ${username}:`, err);
      }
    }
  } catch (error) {
    console.error(`[UserService] Failed to sync user delete across databases:`, error);
  }
}

export namespace UserService {
  export async function create(user: CreateUserDto) {
    if (!user.firstname || user.firstname.trim() === "") {
      throw new Error("User firstname is required and cannot be empty.");
    }
    if (!user.lastname || user.lastname.trim() === "") {
      throw new Error("User lastname is required and cannot be empty.");
    }
    if (!user.username || user.username.trim() === "") {
      throw new Error("User username is required and cannot be empty.");
    }
    if (!user.password || user.password.trim() === "") {
      throw new Error("User password is required and cannot be empty.");
    }
    try {
      const hashPassword = await Bun.password.hash(user.password);
      const newUser = await UserRepository.create({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: hashPassword,
        role: user.role,
        teacher_id: user.teacher_id && user.teacher_id.trim() !== "" ? user.teacher_id : null,
      });

      // Synchronize new user to all other year databases
      await syncCreateAcrossAllDatabases(newUser, hashPassword);

      return newUser;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Username already exists");
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const search = options.search;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const [users, total] = await Promise.all([
      UserRepository.findAll({ skip, take, search }),
      UserRepository.countAll(search),
    ]);

    return buildPaginatedResponse(users, total, page, itemsPerPage);
  }

  export async function findById(userId: string) {
    return UserRepository.findById(userId);
  }

  export async function findByUsername(username: string) {
    return UserRepository.findUserByUsername(username);
  }

  export async function update(userId: string, user: UpdateUserDto) {
    try {
      const data: any = { ...user };
      
      if (user.password) {
        data.password = await Bun.password.hash(user.password);
      }

      if (data.teacher_id !== undefined) {
        data.teacher_id = data.teacher_id && typeof data.teacher_id === "string" && data.teacher_id.trim() !== "" ? data.teacher_id : null;
      }

      // Fetch user to know their username for cross-database synchronization
      const currentUser = await UserRepository.findById(userId);
      const targetUsername = currentUser?.username;

      const updatedUser = await UserRepository.update(userId, data);

      if (targetUsername) {
        await syncUpdateAcrossAllDatabases(targetUsername, data);
      }

      return updatedUser;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Username already exists");
      }
      throw error;
    }
  }

  export async function deleteById(userId: string) {
    const currentUser = await UserRepository.findById(userId);
    if (!currentUser) {
      throw new Error("ไม่พบผู้ใช้งานนี้ในระบบ");
    }
    const targetUsername = currentUser.username;

    // Check if user has associated orders
    const ordersCount = await prisma.order.count({
      where: {
        OR: [
          { user_id: userId },
          { officer_prepare_id: userId },
          { officer_pickup_id: userId },
        ],
      },
    });

    if (ordersCount > 0) {
      throw new Error(
        `ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีประวัติคำสั่งซื้อเค้กที่เกี่ยวข้องอยู่ในระบบ ${ordersCount} รายการ`
      );
    }

    // Explicitly delete any associated tokens
    await prisma.token.deleteMany({
      where: { user_id: userId },
    });

    const deleted = await UserRepository.deleteById(userId);

    if (targetUsername) {
      await syncDeleteAcrossAllDatabases(targetUsername);
    }

    return deleted;
  }

  export async function login(
    username: string,
    password: string,
    jwt: JWTInstance
  ) {
    const user = await UserRepository.findUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await Bun.password.verify(password, user.password);
    } catch (_error) {
      throw new Error("Invalid password");
    }

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const payload = {
      role: user.role,
      username: user.username,
      sub: user.id, // ใส่ user id เข้าไปใน token payload
    };

    // สร้าง JWT token
    const jwtToken = await jwt.sign(payload);

    // สร้าง token ในฐานข้อมูล
    const dbToken = await TokenService.generateToken({ user_id: user.id });

    // Fetch full user details to return (including teacher info)
    const fullUser = await UserRepository.findById(user.id);

    return {
      access_token: jwtToken,
      refresh_token: dbToken.token,
      user: {
        id: fullUser!.id,
        username: fullUser!.username,
        role: fullUser!.role,
        firstname: fullUser!.firstname,
        lastname: fullUser!.lastname,
        email: fullUser!.email,
        teacher_id: fullUser!.teacher_id,
        teacher: (fullUser as any).teacher,
      },
    };
  }
}

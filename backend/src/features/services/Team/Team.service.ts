import { TeamRepository } from "@/features/repository/Team/Team.repository";
import { CreateTeamDto, UpdateTeamDto } from "./Team.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "@/providers/database/database.provider";

export namespace TeamService {
  export async function create(
    team: CreateTeamDto
  ) {
    if (!team.name || team.name.trim() === "") {
      throw new Error("Team name is required and cannot be empty.");
    }
    
    // Validate that at least one classroom is provided
    if (!team.classroom_ids || team.classroom_ids.length === 0) {
      throw new Error("At least one classroom is required.");
    }

    try {
      const newTeam = await TeamRepository.create(team);
      return newTeam;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Team name already exists");
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
    const teams = await TeamRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await TeamRepository.countAll(search);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: teams,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  export async function findById(teamId: string) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    return team;
  }

  export async function update(
    teamId: string,
    data: UpdateTeamDto
  ) {
    // Validate classroom_ids if provided
    if (data.classroom_ids && data.classroom_ids.length === 0) {
      throw new Error("At least one classroom is required.");
    }

    try {
      return await TeamRepository.update(teamId, data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Team not found");
        }
        if (error.code === "P2002") {
          throw new Error("Team name already exists");
        }
      }
      throw error;
    }
  }

  export async function remove(teamId: string) {
    try {
      return await TeamRepository.remove(teamId);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Team not found");
      }
      throw error;
    }
  }

  export async function updateTeamSales(
    teamId: string,
    poundsChange: number,
    bahtChange: number
  ) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const newTotalSalesPounds = (team.total_sales_pounds || 0) + poundsChange;
    const newTotalSalesBaht = (team.total_sales_baht || 0) + bahtChange;

    await TeamRepository.update(teamId, {
      total_sales_pounds: newTotalSalesPounds,
      total_sales_baht: newTotalSalesBaht,
    });
  }

  export async function recalculateTeamSales(teamId: string, tx?: prisma) {
    const client = tx || prisma;
    console.log("recalculateTeamSales: Starting for teamId:", teamId);
    const team = await client.team.findUnique({ where: { id: teamId } });
    if (!team) {
      console.error("recalculateTeamSales: Team not found for teamId:", teamId);
      throw new Error("Team not found");
    }
    console.log("recalculateTeamSales: Fetched team:", team);

    const orders = await client.order.findMany({
      where: { team_id: teamId },
      include: { order_items: true },
    });
    console.log("recalculateTeamSales: Fetched orders for team:", orders);
    let totalPounds = 0;
    let totalBaht = 0;

    for (const order of orders) {
      for (const item of order.order_items) {
        totalPounds += item.pound * item.quantity;
        totalBaht += item.subtotal;
      }
    }
    console.log("recalculateTeamSales: Calculated totalPounds:", totalPounds, "totalBaht:", totalBaht);

    await client.team.update({
      where: { id: teamId },
      data: {
        total_sales_pounds: totalPounds,
        total_sales_baht: totalBaht,
      },
    });
    console.log("recalculateTeamSales: Team sales updated for teamId:", teamId);
  }
}

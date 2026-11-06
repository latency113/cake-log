import { GradeLevelRepository } from "@/features/repository/GradeLevel/GradeLevel.repository"
import { CreateGradeLevelDto, GradeLevelSchema, UpdateGradeLevelDto } from "./GradeLevel.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace GradeLevelService {
  export async function create(
    GradeLevel: CreateGradeLevelDto
  ) {
    if (!GradeLevel.level) {
      throw new Error('GradeLevel level is required.');
    }
    if (GradeLevel.year === undefined || GradeLevel.year === null) {
      throw new Error('GradeLevel year is required.');
    }
    try {
      const newGradeLevel = await GradeLevelRepository.create(GradeLevel);
      return newGradeLevel;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Duplicate GradeLevel (level, year) combination");
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
    const [gradeLevels, total] = await Promise.all([
      GradeLevelRepository.findAll({ skip, take, search }),
      GradeLevelRepository.countAll(search),
    ]);

    return buildPaginatedResponse(gradeLevels, total, page, itemsPerPage);
  }

  export async function findById(GradeLevelId: string) {
    return GradeLevelRepository.findById(GradeLevelId);
  }

  export async function update(
    GradeLevelId: string,
    GradeLevel: UpdateGradeLevelDto
  ) {
    try {
      const data = { ...GradeLevel };
      return await GradeLevelRepository.update(GradeLevelId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Duplicate GradeLevel (level, year) combination");
      }
      throw error;
    }
  }

  export async function deleteById(GradeLevelId: string) {
    return GradeLevelRepository.deleteById(GradeLevelId);
  }
}

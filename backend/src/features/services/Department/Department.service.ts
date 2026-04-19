import { DepartmentRepository } from "@/features/repository/Department/Department.repository";
import {
  CreateDepartmentDto,
  DepartmentSchema,
  UpdateDepartmentDto,
} from "./Department.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace DepartmentService {
  export async function create(Department: CreateDepartmentDto) {
    if (!Department.name || Department.name.trim() === "") {
      throw new Error("Department name is required and cannot be empty.");
    }

    const existingDepartment = await DepartmentRepository.findByName(
      Department.name
    );
    console.log("Existing Department:", existingDepartment);
    if (existingDepartment) {
      throw new Error("Department Name already exists");
    }

    try {
      const newDepartment = await DepartmentRepository.create(Department);
      return newDepartment;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Department Name already exists");
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
    const Departments = await DepartmentRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await DepartmentRepository.countAll(search);

    const totalPages = ((total + itemsPerPage - 1) / itemsPerPage) >> 0;
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: Departments,
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

  export async function findById(DepartmentId: string) {
    return DepartmentRepository.findById(DepartmentId);
  }

  export async function update(
    DepartmentId: string,
    Department: UpdateDepartmentDto
  ) {
    try {
      const data = { ...Department };
      return await DepartmentRepository.update(DepartmentId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Department Name already exists");
      }
      throw error;
    }
  }

  export async function deleteById(DepartmentId: string) {
    return DepartmentRepository.deleteById(DepartmentId);
  }

  export async function deleteByIds(ids: string[]) {
    return DepartmentRepository.deleteByIds(ids);
  }

  export async function clearAllDepartments() {
    return DepartmentRepository.clearAllDepartment();
  }
}

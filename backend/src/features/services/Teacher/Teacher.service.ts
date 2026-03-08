import { TeacherRepository } from "@/features/repository/Teacher/Teacher.repository"
import { CreateTeacherDto, TeacherSchema, UpdateTeacherDto } from "./Teacher.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace TeacherService {
  export async function create(
    teacher: CreateTeacherDto
  ) {
    if (!teacher.name || teacher.name.trim() === '') {
      throw new Error('Teacher name is required and cannot be empty.');
    }

    const existingTeacher = await TeacherRepository.findByName(teacher.name);
    if (existingTeacher) {
      throw new Error("Teacher name already exists");
    }

    try {
      const newTeacher = await TeacherRepository.create(teacher);
      return newTeacher;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Teacher name already exists");
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
    const Teachers = await TeacherRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await TeacherRepository.countAll(search);

    const totalPages = ((total + itemsPerPage - 1) / itemsPerPage) >> 0;
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: Teachers,
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

  export async function findById(TeacherId: string) {
    return TeacherRepository.findById(TeacherId);
  }

  export async function update(
    TeacherId: string,
    Teacher: UpdateTeacherDto
  ) {
    try {
      const data = { ...Teacher };
      return await TeacherRepository.update(TeacherId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Teachername already exists");
      }
      throw error;
    }
  }

  export async function clearAllTeachers() {
    return TeacherRepository.clearAllTeachers();
  }

  export async function deleteById(TeacherId: string) {
    return TeacherRepository.deleteById(TeacherId);
  }
}

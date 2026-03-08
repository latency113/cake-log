import prisma from "@/providers/database/database.provider";
import {
  CreateClassroomDto,
  UpdateClassroomDto,
} from "@/features/services/Classroom/Classroom.schema";
import { GradeLevel } from "@/providers/database/generated/client";


export namespace ClassroomRepository {
  // --- [NEW] ฟังก์ชันสำหรับ Import Excel (สร้างทุกอย่างในรวดเดียว) ---
  export async function createWithDependencies(data: {
    name: string;
    students: any[]; // รับ array ของนักเรียน
    departmentName: string;
    teacherName: string;
    gradeLevel: GradeLevel;
    gradeYear: number;
  }) {
    // ใช้ connectOrCreate เพื่อจัดการความสัมพันธ์แบบอัตโนมัติ
    return await prisma.classroom.create({
      data: {
        name: data.name,
        students: data.students as Prisma.InputJsonValue, // แปลง type ให้ตรงกับ Prisma JSON

        // 1. จัดการ GradeLevel (ระดับชั้น)
        // ถ้ามี (ปวช, 1) อยู่แล้วก็ใช้เลย ถ้าไม่มีก็สร้างใหม่
        grade_level: {
          connectOrCreate: {
            where: {
              level_year: {
                level: data.gradeLevel,
                year: data.gradeYear,
              },
            },
            create: {
              level: data.gradeLevel,
              year: data.gradeYear,
            },
          },
        },

        // 2. จัดการ Department (แผนก) ของห้องเรียนนี้
        department: {
          connectOrCreate: {
            where: { name: data.departmentName },
            create: { name: data.departmentName },
          },
        },

        // 3. จัดการ Teacher (ครูที่ปรึกษา)
        teacher: {
          connectOrCreate: {
            where: { name: data.teacherName },
            create: {
              name: data.teacherName,
              // *สำคัญ* ถ้าต้องสร้างครูใหม่ ต้องระบุแผนกให้ครูด้วย
              // เราก็ใช้แผนกเดียวกับห้องเรียนนี่แหละ
              department: {
                connectOrCreate: {
                  where: { name: data.departmentName },
                  create: { name: data.departmentName },
                },
              },
            },
          },
        },
      },
    });
  }

  // --- ฟังก์ชันเดิม (คงไว้สำหรับการสร้างผ่านหน้าเว็บปกติ) ---
  export async function create(Classroom: CreateClassroomDto) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: Classroom.teacher_id },
    });

    const department = await prisma.department.findUnique({
      where: { id: Classroom.department_id },
    });

    if (!teacher) {
      throw new Error(`Teacher with id ${Classroom.teacher_id} not found`);
    }

    const grade_level = await prisma.gradeLevel.findUnique({
      where: { id: Classroom.grade_level_id },
    });

    if (!grade_level) {
      throw new Error(
        `GradeLevel with id ${Classroom.grade_level_id} not found`
      );
    }

    return prisma.classroom.create({
      data: {
        ...Classroom,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
    department_id?: string;
  }) {
    const where: any = options.search
      ? {
          name: {
            contains: options.search,
            mode: "insensitive",
          },
        }
      : {};

    if (options.department_id) {
      where.department_id = options.department_id;
    }

    return prisma.classroom.findMany({
      where,
      include: {
        department: true,
        grade_level: true,
        teacher: true,
        orders: true,
      },
      orderBy: [
        {
          grade_level: {
            level: "desc",
          },
        },
        {
          grade_level: {
            year: "asc",
          },
        },
      ],
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(ClassroomId: string) {
    return await prisma.classroom.findUnique({
      where: {
        id: ClassroomId,
      },
      include: {
        department: true,
        grade_level: true,
        teacher: true,
        orders: {
          include: {
            order_items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  export async function update(
    ClassroomId: string,
    Classroom: UpdateClassroomDto
  ) {
    try {
      const allowedPrismaFields = [
        "name",
        "teacher_id",
        "department_id",
        "grade_level_id",
      ];
      const updateData: Record<string, any> = {};

      for (const key of allowedPrismaFields) {
        if (
          Object.prototype.hasOwnProperty.call(Classroom, key) &&
          (Classroom as any)[key] !== undefined
        ) {
          updateData[key] = (Classroom as any)[key];
        }
      }

      if (
        Object.prototype.hasOwnProperty.call(Classroom, "students") &&
        (Classroom as any).students !== undefined
      ) {
        const incomingStudents = (Classroom as any).students;
        if (typeof incomingStudents === "string") {
          try {
            updateData.students = JSON.parse(incomingStudents);
          } catch (e) {
            console.error(
              "Failed to parse students JSON string for Prisma update:",
              e
            );
          }
        } else if (Array.isArray(incomingStudents)) {
          updateData.students = incomingStudents;
        }
      }

      return prisma.classroom.update({
        where: {
          id: ClassroomId,
        },
        data: updateData,
      });
    } catch (error) {
      console.error(
        `Error updating classroom ${ClassroomId} in repository:`,
        error
      );
      throw error;
    }
  }

  export async function deleteById(ClassroomId: string) {
    return prisma.classroom.delete({
      where: {
        id: ClassroomId,
      },
    });
  }

  export async function clearAllClassrooms() {
    return prisma.classroom.deleteMany({});
  }

  export async function countAll(search?: string, department_id?: string) {
    const where: any = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    if (department_id) {
      where.department_id = department_id;
    }
    return await prisma.classroom.count({ where });
  }

  export async function finalizeOrder(classroomId: string) {
    return prisma.classroom.update({
      where: {
        id: classroomId,
      },
      data: {
        isOrderFinalized: true,
      },
    });
  }
}

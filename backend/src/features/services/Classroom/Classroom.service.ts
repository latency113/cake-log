import { ClassroomRepository } from "@/features/repository/Classroom/Classroom.repository";
import { CreateClassroomDto, UpdateClassroomDto } from "./Classroom.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as ExcelJS from "exceljs"; // ใช้ตัวนี้ตัวเดียวพอครับ เลิกใช้ xlsx
import { StudentService } from "../student/student.service";
import { GradeLevelType } from "../../../providers/database/generated/client";
export namespace ClassroomService {
  
  // --- Helper Function ---
  function parseGradeLevel(text: string) {
    // text ต้นฉบับจาก Excel C8 เช่น "ปวช.1/1" หรือ "ปวส.2/1"
    const cleaned = text.trim();
    
    // 1. หาระดับชั้น (Logic เดิม)
    const level = cleaned.startsWith("ปวส") 
      ? GradeLevelType.HIGHER 
      : GradeLevelType.VOCATIONAL;

    // 2. หาชั้นปี (Logic เดิม)
    const yearMatch = cleaned.match(/(\d+)/);
    const year = yearMatch ? parseInt(yearMatch[0]) : 1;

    // 3. [ใหม่] สร้างชื่อห้องแบบสั้น (ตัด ปวช./ปวส. ออก)
    // ลบคำว่า "ปวช." หรือ "ปวส." หรือ "ปวช" หรือ "ปวส" ที่อยู่ข้างหน้าออก
    // ผลลัพธ์: "ปวช.1/1" -> "1/1"
    const shortRoomName = cleaned
        .replace(/^(ปวช\.|ปวส\.|ปวช|ปวส)/g, '') 
        .trim();

    return { level, year, name: shortRoomName };
  }

  // --- ฟังก์ชัน Import (ปรับปรุงส่วน Department) ---
  export async function importClassroomsFromExcel(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const results = [];

    for (const worksheet of workbook.worksheets) {
      // 1. อ่าน Metadata
      const teacherName = worksheet.getCell('F8').text?.trim();
      // ถ้าใน Excel มีคำนำหน้า เช่น "ครูที่ปรึกษา นางสาว..." อยากตัดออกให้เหลือแค่ชื่อ
      const cleanTeacherName = teacherName
          ? teacherName.replace('ครูที่ปรึกษา', '').trim() 
          : null;

      if (!cleanTeacherName) continue; 

      // 2. จัดการชื่อแผนก (F7)
      // ต้นฉบับ: "ชื่อกลุ่มเรียน การบัญชี 1" -> อยากได้ "การบัญชี"
      let rawDeptName = worksheet.getCell('F7').text?.trim() || 'แผนกทั่วไป';
      
      // Step A: ลบคำว่า "ชื่อกลุ่มเรียน" หรือ "รหัสกลุ่มเรียน" ออก
      let cleanDeptName = rawDeptName
          .replace(/^(ชื่อกลุ่มเรียน|รหัสกลุ่มเรียน)/g, '')
          .trim();

      // Step B: (Optional) ถ้าอยากเอาตัวเลขท้ายชื่อแผนกออก (เช่น "การบัญชี 1" -> "การบัญชี")
      // ใช้ Regex ลบตัวเลขที่อยู่ท้ายสุดออก
      cleanDeptName = cleanDeptName.replace(/\s+\d+$/, ''); 

      // 3. จัดการชื่อห้อง (C8)
      const gradeText = worksheet.getCell('C8').text?.trim() || '';
      const { level, year, name: roomName } = parseGradeLevel(gradeText);

      // ... (ส่วนอ่านนักเรียนเหมือนเดิม) ...
      const students: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 11) {
          const studentId = row.getCell(3).text?.trim();
          const studentName = row.getCell(4).text?.trim();
          if (studentId && studentName) {
            students.push({ studentId, studentName });
          }
        }
      });

      console.log(`Importing: ห้อง ${roomName} (${level}) | แผนก ${cleanDeptName} | ครู ${cleanTeacherName}`);

      try {
        const createdClassroom = await ClassroomRepository.createWithDependencies({
           name: roomName, // ส่งชื่อสั้นๆ ไป (เช่น "1/1")
           students: students,
           departmentName: cleanDeptName, // ส่งชื่อแผนกที่ตัดคำแล้ว (เช่น "การบัญชี")
           teacherName: cleanTeacherName, // ส่งชื่อครูที่ตัดคำแล้ว
           gradeLevel: level,
           gradeYear: year
        });
        results.push(createdClassroom);
      } catch (err) {
        console.error(`Failed to import sheet ${worksheet.name}:`, err);
      }
    }

    return { importedCount: results.length, details: results };
  }

  // --- 2. ฟังก์ชันเดิม: อัปโหลดแค่นักเรียน (ปรับมาใช้ ExcelJS เพื่อลด dependency) ---
  export async function uploadStudentsFromExcel(
    classroomId: string,
    file: File
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // เอา Sheet แรกสุด
    const worksheet = workbook.worksheets[0];
    const students: any[] = [];

    // วนลูปอ่าน (Logic เดียวกับ importClassroomsFromExcel)
    worksheet.eachRow((row, rowNumber) => {
      // เริ่มแถว 11
      if (rowNumber >= 11) {
        const studentId = row.getCell(3).text?.trim(); // Column C
        const studentName = row.getCell(4).text?.trim(); // Column D

        if (studentId && studentName) {
          students.push({ studentId, studentName });
        }
      }
    });

    console.log("Parsed students data:", students);

    try {
      const existingClassroom = await ClassroomRepository.findById(classroomId);
      if (!existingClassroom) {
        throw new Error(`Classroom with ID ${classroomId} not found.`);
      }

      const updatedClassroom = await ClassroomRepository.update(
        classroomId,
        { students: students } // ส่ง array ไปได้เลย เพราะ repository จัดการต่อ
      );

      return updatedClassroom;
    } catch (error: any) {
      console.error("Error during student upload:", error);
      throw new Error(`Failed to upload students: ${error.message}`);
    }
  }

  // --- ฟังก์ชันอื่นๆ คงเดิม ---

  export async function getStudentsWithCakePounds(classroomId: string) {
    const classroom = await ClassroomRepository.findById(classroomId);

    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found.`);
    }

    let students: { studentId: string; studentName: string }[] = [];
    if (Array.isArray(classroom.students)) {
      students = (classroom.students as any[]).filter(
        (s): s is { studentId: string; studentName: string } =>
          s && typeof s.studentId === 'string' && s.studentId.trim() !== '' &&
          typeof s.studentName === 'string'
      );
    }

    const studentService = new StudentService();
    return await studentService.getTotalPoundsPerStudentByClassroom(classroomId, students);
  }

  export async function create(Classroom: CreateClassroomDto) {
    if (!Classroom.name || Classroom.name.trim() === "") {
      throw new Error("Classroom name is required.");
    }
    try {
      return await ClassroomRepository.create(Classroom);
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Classroom name already exists");
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string, department_id?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const { skip, take } = getPaginationParams(page, itemsPerPage);

    const Classrooms = await ClassroomRepository.findAll({
      skip,
      take,
      search: options.search,
      department_id: options.department_id
    });

    const sanitizedClassrooms = Classrooms.map((classroom) => {
      if (classroom.students && Array.isArray(classroom.students)) {
        classroom.students = (classroom.students as any[]).filter(s => s?.studentId);
      } else {
        classroom.students = [];
      }
      return classroom;
    });

    const total = await ClassroomRepository.countAll(options.search, options.department_id);
    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      data: sanitizedClassrooms,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage: page < totalPages,
        previousPage: page > 1,
      },
    };
  }

  export async function findById(ClassroomId: string) {
    return ClassroomRepository.findById(ClassroomId);
  }

export async function update(
    ClassroomId: string, 
    // รับทั้ง DTO และ File (อาจจะเป็น undefined ถ้าไม่ได้อัปโหลด)
    payload: UpdateClassroomDto & { file?: File } 
  ) {
    try {
      // แยก file ออกมาจากข้อมูลอื่นๆ
      const { file, ...updateData } = payload;
      let studentsFromFile: any[] = [];

      // 1. ถ้ามีไฟล์แนบมา ให้แกะข้อมูลนักเรียนจาก Excel
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0]; // เอา Sheet แรก

        // เริ่มอ่านแถวที่ 11 (ตามฟอร์ม Excel ของคุณ)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber >= 11) {
            const studentId = row.getCell(3).text?.trim(); // Col C
            const studentName = row.getCell(4).text?.trim(); // Col D
            
            if (studentId && studentName) {
              studentsFromFile.push({ studentId, studentName });
            }
          }
        });

        // ยัดข้อมูลนักเรียนที่แกะได้ ใส่กลับเข้าไปใน updateData
        // (Prisma รอรับ field 'students' เป็น JSON)
        (updateData as any).students = studentsFromFile;
      }

      // 2. ส่งข้อมูลที่เตรียมเสร็จแล้วไปให้ Repository บันทึก
      return await ClassroomRepository.update(ClassroomId, updateData);

    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Classroom name already exists");
      }
      throw error;
    }
  }

  export async function clearAllClassrooms() {
    return ClassroomRepository.clearAllClassrooms();
  }

  export async function deleteById(ClassroomId: string) {
    return ClassroomRepository.deleteById(ClassroomId);
  }

  export async function finalizeClassroomOrders(classroomId: string) {
    return ClassroomRepository.finalizeOrder(classroomId);
  }
}
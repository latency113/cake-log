// src/features/services/Classroom/promote.service.ts

import prisma from "@/providers/database/database.provider";
import { performBackup } from "../admin/backup.service";

// --- Helper Function: ย้ายออกมาไว้ข้างนอก ---
function incrementRoomName(oldName: string): string {
  // แยก string ด้วยเครื่องหมาย "/"
  const parts = oldName.split("/");

  if (parts.length === 2 && !isNaN(Number(parts[0]))) {
    const currentYear = Number(parts[0]);
    const roomNumber = parts[1];
    return `${currentYear + 1}/${roomNumber}`; // คืนค่า "2/1"
  }

  // กรณีชื่อห้องเป็นแบบอื่นคืนค่าเดิม
  return oldName;
}

// --- Main Service ---
export const promoteAllClassrooms = async () => {
  console.log("Starting annual student promotion...");

  try {
    // 0. Create a backup before modifying anything
    // Add a small delay to ensure any pending file operations are done, though unlikely needed
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Creating backup before promotion...");
    await performBackup("PRE_PROMOTION");
    console.log("Backup created successfully.");

    // 1. ดึงข้อมูล GradeLevel ทั้งหมดมาเก็บไว้เทียบค่า
    const allLevels = await prisma.gradeLevel.findMany();

    // 2. ดึงห้องเรียนทั้งหมด
    const classrooms = await prisma.classroom.findMany({
      include: { grade_level: true },
      orderBy: {
        grade_level: {
          year: 'desc', 
        },
      },
    });

    for (const room of classrooms) {
      // ข้ามห้องที่ไม่มี Grade Level
      if (!room.grade_level) continue;

      const currentType = room.grade_level.level;
      const currentYear = room.grade_level.year;

      // Logic หา ID ของปีถัดไป
      const nextLevelObj = allLevels.find(
        (l) => l.level === currentType && l.year === currentYear + 1
      );

      if (nextLevelObj) {
        // === กรณีเลื่อนชั้นปกติ ===
        const newName = incrementRoomName(room.name);

        await prisma.classroom.update({
          where: { id: room.id },
          data: {
            grade_level_id: nextLevelObj.id,
            name: newName,
          },
        });

        console.log(`Promoted Room: ${room.name} -> ${newName}`);
      } else {
        // === กรณีจบการศึกษา ===
        console.log(`Graduating Room: ${room.name} (Year ${currentYear})`);

        await prisma.classroom.delete({
          where: { id: room.id },
        });
      }
    }

    console.log("Promotion completed successfully.");
    return { success: true, message: "อัพเดทชั้นปีเรียบร้อย" };

  } catch (error) {
    console.error("Error promoting classrooms:", error);
    return { success: false, message: "Error promoting classrooms" };
  }
};
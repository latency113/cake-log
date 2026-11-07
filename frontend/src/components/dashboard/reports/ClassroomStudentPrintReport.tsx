// src/components/dashboard/reports/ClassroomStudentPrintReport.tsx
import React from "react";
import type { Classroom } from "../../../types/classroom";

interface ClassroomStudentPrintReportProps {
  classroom: Classroom;
  studentsCakeData: {
    students: {
      studentId: string;
      studentName: string;
      totalPounds: number;
    }[];
    totalPoundsForClassroom: number;
  } | null;
  printId?: string;
  academicYear?: string;
  advisorName?: string;
}

const ClassroomStudentPrintReport: React.FC<ClassroomStudentPrintReportProps> = ({
  classroom,
  studentsCakeData,
  printId = "printable-classroom-students-section",
  academicYear,
  advisorName,
}) => {
  if (!studentsCakeData || studentsCakeData.students.length === 0) {
    return (
      <div id={printId} className="print-only p-4 text-center text-gray-500">
        ไม่มีนักเรียนในห้องเรียนนี้ หรือไม่มีข้อมูลเค้ก
      </div>
    );
  }

  const gradeLevelText = classroom.grade_level
    ? `${
        classroom.grade_level.level === "VOCATIONAL"
          ? "ปวช."
          : classroom.grade_level.level === "HIGHER"
          ? "ปวส."
          : classroom.grade_level.level
      } ${classroom.grade_level.year}`
    : "ไม่ระบุระดับชั้น";

  const displayYear = academicYear || localStorage.getItem("academicYear") || (new Date().getFullYear() + 543).toString();
  const displayAdvisor = advisorName || (classroom.teacher ? classroom.teacher.name : "-");

  return (
    <div className="print-only text-black" id={printId}>
      {/* Header section - Compact */}
      <div className="text-center mb-2">
        <h1 className="text-base font-bold tracking-tight text-gray-900 leading-tight">
          วิทยาลัยอาชีวศึกษานครปฐม
        </h1>
        <h2 className="text-sm font-bold text-gray-800 leading-tight mt-0.5">
          รายงานรายชื่อนักเรียนและยอดการสั่งจองเค้ก ประจำปีการศึกษา {displayYear}
        </h2>
      </div>

      {/* Classroom Info Summary Card - Compact */}
      <div className="border border-black rounded-xs py-1.5 px-3 mb-2.5 text-xs bg-gray-50/30">
        <div className="grid grid-cols-2 gap-y-1 gap-x-4">
          <div className="flex items-baseline">
            <span className="font-bold text-gray-900 w-20 shrink-0">ระดับชั้น:</span>
            <span className="text-gray-800 font-semibold">{gradeLevelText}</span>
            <span className="font-bold text-gray-900 ml-4 mr-1.5">ห้อง:</span>
            <span className="text-gray-800 font-semibold">{classroom.name}</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold text-gray-900 w-20 shrink-0">แผนกวิชา:</span>
            <span className="text-gray-800">{classroom.department?.name || "ไม่ระบุ"}</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold text-gray-900 w-20 shrink-0">ครูที่ปรึกษา:</span>
            <span className="text-gray-800">{displayAdvisor}</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold text-gray-900 w-20 shrink-0">จำนวนนักเรียน:</span>
            <span className="text-gray-800 font-semibold">{studentsCakeData.students.length} คน</span>
            <span className="font-bold text-gray-900 ml-4 mr-1.5">ยอดรวม:</span>
            <span className="text-gray-900 font-bold">{studentsCakeData.totalPoundsForClassroom.toLocaleString()} ปอนด์</span>
          </div>
        </div>
      </div>

      {/* Students Cake Table - Compact */}
      <div className="w-full overflow-hidden">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-slate-100 text-gray-900 font-bold">
              <th className="border border-black px-1.5 py-1 text-center w-[8%]">
                ลำดับ
              </th>
              <th className="border border-black px-2 py-1 text-center w-[20%]">
                รหัสนักเรียน
              </th>
              <th className="border border-black px-2.5 py-1 text-left w-[50%]">
                ชื่อ - นามสกุล
              </th>
              <th className="border border-black px-2 py-1 text-right w-[22%]">
                จำนวนเค้ก (ปอนด์)
              </th>
            </tr>
          </thead>
          <tbody>
            {studentsCakeData.students.map((student, index) => (
              <tr key={student.studentId || index} className="even:bg-gray-50/30">
                <td className="border border-black px-1.5 py-[3px] text-center text-gray-900">
                  {index + 1}
                </td>
                <td className="border border-black px-2 py-[3px] text-center font-mono text-gray-900">
                  {student.studentId.replace(/\u200B/g, "")}
                </td>
                <td className="border border-black px-2.5 py-[3px] text-left text-gray-900">
                  {student.studentName}
                </td>
                <td className="border border-black px-2 py-[3px] text-right font-medium text-gray-900">
                  {student.totalPounds.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 text-gray-900 font-bold">
              <td
                colSpan={3}
                className="border border-black px-3 py-1 text-right text-gray-900 font-bold"
              >
                รวมยอดการสั่งจองเค้กทั้งหมด:
              </td>
              <td className="border border-black px-2 py-1 text-right text-gray-900 font-bold">
                {studentsCakeData.totalPoundsForClassroom.toLocaleString()} ปอนด์
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Signature Section - Compact */}
      <div className="mt-3 pt-1 flex justify-end" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
        <div className="text-center w-64 space-y-1 text-xs text-gray-900">
          <p>ลงชื่อ..........................................................</p>
          <p className="font-medium">({displayAdvisor})</p>
          <p className="text-gray-700">ครูประจำชั้น / ครูที่ปรึกษา</p>
          <p className="text-gray-600">วันที่............/............/............</p>
        </div>
      </div>
    </div>
  );
};

export default ClassroomStudentPrintReport;

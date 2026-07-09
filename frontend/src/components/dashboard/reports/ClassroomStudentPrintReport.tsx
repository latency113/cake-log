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
}

const ClassroomStudentPrintReport: React.FC<ClassroomStudentPrintReportProps> = ({
  classroom,
  studentsCakeData,
  printId,
}) => {
  if (!studentsCakeData || studentsCakeData.students.length === 0) {
    return <p className="text-center text-muted-foreground print-only">ไม่มีนักเรียนในห้องเรียนนี้ หรือไม่มีข้อมูลเค้ก</p>;
  }

  return (
    <div className="print-only" id={printId}>
      <h1 className="text-2xl font-bold mb-4 text-center">
        รายงานจำนวนเค้กของนักเรียนในห้องเรียน
      </h1>
      <div className="mb-2 text-lg flex gap-2">
        <p>
          แผนก: <span className="font-semibold">{classroom.department?.name || "ไม่ระบุ"}</span>
        </p>
        <p>
          ห้อง <span className="font-semibold">{classroom.name}</span>
        </p>
        <p>
          ระดับชั้น: <span className="font-semibold">
            {classroom.grade_level
              ? `${
                  classroom.grade_level.level === "VOCATIONAL"
                    ? "ปวช."
                    : classroom.grade_level.level === "HIGHER"
                    ? "ปวส."
                    : classroom.grade_level.level
                } ${classroom.grade_level.year}`
              : "ไม่ระบุระดับชั้น"}{" "}<span className="font-normal">
                นักเรียนทั้งหมด {studentsCakeData ? studentsCakeData.students.length : 0} คน
                </span>
          </span>
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">
                เลขที่
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">
                รหัสนักเรียน
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">
                ชื่อ-นามสกุล
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b border-gray-300">
                จำนวนเค้ก (ปอนด์)
              </th>
            </tr>
          </thead>
          <tbody>
            {studentsCakeData.students.map((student, index) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-300">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-300">
                  {student.studentId.replace(/\u200B/g, "")}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-300">
                  {student.studentName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium border-b border-gray-300">
                  {student.totalPounds}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="mb-5">
            <tr className="bg-gray-100">
              <td
                colSpan={3}
                className="px-4 py-3 text-sm font-semibold text-gray-900 text-right border-r border-gray-300"
              >
                รวมทั้งหมด:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                {studentsCakeData.totalPoundsForClassroom} ปอนด์
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ClassroomStudentPrintReport;
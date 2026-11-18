// src/components/dashboard/reports/ClassroomStudentPrintReport.tsx
import React from "react";
import type { Classroom } from "../../../types/classroom";
import type { Order } from "../../../types/order";
import AutoShrinkText from "../../common/AutoShrinkText";

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
  classroomOrders?: Order[];
  printId?: string;
  advisorName?: string;
}

const ClassroomStudentPrintReport: React.FC<ClassroomStudentPrintReportProps> = ({
  classroom,
  studentsCakeData,
  classroomOrders = [],
  printId = "printable-classroom-students-section",
  advisorName,
}) => {
  if (!studentsCakeData || studentsCakeData.students.length === 0) {
    return (
      <div id={printId} className="print-only p-4 text-center text-gray-500">
        ไม่มีนักเรียนในห้องเรียนนี้ หรือไม่มีข้อมูลเค้ก
      </div>
    );
  }

  // Format grade level to match format in form (e.g. ปวช. 1/1, ปวส. 2/1, ป.ตรี 1/1)
  const formatGradeLevel = (): string => {
    const levelStr = classroom.grade_level
      ? classroom.grade_level.level === "VOCATIONAL"
        ? "ปวช."
        : classroom.grade_level.level === "HIGHER"
        ? "ปวส."
        : classroom.grade_level.level
      : "";
    const yearStr = classroom.grade_level?.year || "";
    const roomName = classroom.name || "";

    if (!levelStr && !roomName) return "-";
    if (!levelStr) return roomName;

    if (roomName.includes("/")) {
      return `${levelStr} ${roomName}`;
    }
    if (yearStr && roomName) {
      return `${levelStr} ${yearStr}/${roomName}`;
    }
    return `${levelStr} ${yearStr} ห้อง ${roomName}`.trim();
  };

  const gradeLevelText = formatGradeLevel();
  const departmentName = classroom.department?.name || "-";
  const displayAdvisor = advisorName || (classroom.teacher ? classroom.teacher.name : "-");

  const STUDENTS_PER_PAGE = 30;
  const allStudents = studentsCakeData.students;
  const totalPages = Math.ceil(allStudents.length / STUDENTS_PER_PAGE) || 1;

  // Normalize helper for student name matching
  const normalize = (str: string) => (str || "").replace(/\s+/g, "").trim().toLowerCase();

  // Pre-calculate orders per student (pounds, amount, discount)
  const studentStatsMap = new Map<
    string,
    { pounds: number; amount: number; discount: number }
  >();

  let totalAmountSum = 0;
  let totalPoundsSum = 0;
  let totalDiscountSum = 0;

  allStudents.forEach((student) => {
    const targetName = student.studentName.trim();
    const normalizedTarget = normalize(targetName);

    let matchedOrders = classroomOrders.filter((order) => {
      if (!order.customerName) return false;
      const orderName = order.customerName.trim();
      return orderName === targetName || normalize(orderName) === normalizedTarget;
    });

    if (matchedOrders.length === 0) {
      const nameParts = targetName.split(/\s+/).filter((part) => part.length > 2);
      matchedOrders = classroomOrders.filter((order) => {
        if (!order.customerName) return false;
        const normalizedOrder = normalize(order.customerName);
        return nameParts.some((part) => normalizedOrder.includes(normalize(part)));
      });
    }

    const orderPounds = matchedOrders.reduce((sum, order) => {
      const pSum = (order.order_items || []).reduce(
        (acc, item) => acc + (item.pound || 0) * (item.quantity || 0),
        0
      );
      return sum + pSum;
    }, 0);

    const pounds = orderPounds > 0 ? orderPounds : (student.totalPounds || 0);
    const amount = matchedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const discount = pounds * 10;

    studentStatsMap.set(student.studentId, {
      pounds,
      amount,
      discount,
    });

    totalPoundsSum += pounds;
    totalAmountSum += amount;
    totalDiscountSum += discount;
  });

  // Calculate participating count and rate
  const totalStudentsCount = allStudents.length;
  const participatingStudentsCount = allStudents.filter((student) => {
    const stats = studentStatsMap.get(student.studentId);
    return (stats?.pounds || student.totalPounds || 0) > 0;
  }).length;

  const participationRate =
    totalStudentsCount > 0
      ? ((participatingStudentsCount / totalStudentsCount) * 100)
          .toFixed(2)
          .replace(/\.00$/, "")
      : "0";

  const pages = [];
  for (let i = 0; i < allStudents.length; i += STUDENTS_PER_PAGE) {
    pages.push(allStudents.slice(i, i + STUDENTS_PER_PAGE));
  }

  return (
    <div className="print-only text-black" id={printId}>
      {pages.map((studentChunk, pageIndex) => {
        const isLastPage = pageIndex === totalPages - 1;
        const pageNumber = pageIndex + 1;

        return (
          <div
            key={pageIndex}
            className="classroom-student-print-page"
            style={{
              pageBreakAfter: isLastPage ? "auto" : "always",
              breakAfter: isLastPage ? "auto" : "page",
            }}
          >
            {/* 3-Line Header as in Official Form */}
            <div className="text-center mb-3">
              <h1 className="text-base font-bold text-black leading-tight">
                วิทยาลัยอาชีวศึกษานครปฐม
              </h1>
              <h2 className="text-sm font-bold text-black leading-tight mt-0.5">
                โครงการหารายได้ระหว่างเรียน กิจกรรมสัปดาห์เค้กปีใหม่
              </h2>
              <p className="text-[12px] font-medium text-black mt-1 leading-normal">
                <span>รายชื่อนักเรียน</span>
                <span className="mx-1.5">แผนกวิชา {departmentName}</span>
                <span className="mx-1.5">ระดับชั้น {gradeLevelText}</span>
                <span className="mx-1.5">ครูที่ปรึกษา {displayAdvisor}</span>
                {totalPages > 1 && (
                  <span className="font-normal text-[11px] ml-2 text-gray-700">
                    (หน้า {pageNumber}/{totalPages})
                  </span>
                )}
              </p>
            </div>

            {/* Students Table with 8 Columns */}
            <div className="w-full box-border">
              <table className="w-full border-collapse border border-black text-[11px] text-black table-fixed">
                <thead>
                  <tr className="bg-white font-semibold text-center text-[11px] leading-tight">
                    <th className="border border-black px-0.5 py-1 text-center w-[6%] align-middle">
                      <div className="leading-tight">
                        <div>ลำดับ</div>
                        <div>ที่</div>
                      </div>
                    </th>
                    <th className="border border-black px-1 py-1 text-center w-[13.5%] align-middle whitespace-nowrap">
                      รหัสประจำตัว
                    </th>
                    <th className="border border-black px-2 py-1 text-center w-[28%] align-middle whitespace-nowrap">
                      ชื่อ - นามสกุล
                    </th>
                    <th className="border border-black px-1 py-1 text-center w-[11.5%] align-middle leading-tight">
                      <div className="whitespace-nowrap">รวมปอนด์ทั้งสิ้น</div>
                      <div className="font-normal text-[10px] whitespace-nowrap mt-0.5">(ต่อคน)</div>
                    </th>
                    <th className="border border-black px-1 py-1 text-center w-[12%] align-middle leading-tight">
                      <div className="whitespace-nowrap">รวมเงินทั้งสิ้น</div>
                      <div className="font-normal text-[10px] whitespace-nowrap mt-0.5">(ก่อนหักส่วนลด)</div>
                    </th>
                    <th className="border border-black px-0.5 py-1 text-center w-[11%] align-middle leading-tight">
                      <div className="whitespace-nowrap">ส่วนลดที่</div>
                      <div className="whitespace-nowrap">นักเรียนได้รับ</div>
                    </th>
                    <th className="border border-black px-0.5 py-1 text-center w-[10.5%] align-middle leading-tight">
                      <div className="whitespace-nowrap">ลายเซ็น</div>
                      <div className="whitespace-nowrap">นักเรียน</div>
                    </th>
                    <th className="border border-black px-1 py-1 text-center w-[7.5%] align-middle whitespace-nowrap border-r border-r-black">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentChunk.map((student, idx) => {
                    const studentNumber = pageIndex * STUDENTS_PER_PAGE + idx + 1;
                    const stats = studentStatsMap.get(student.studentId);
                    const pounds = stats?.pounds ?? student.totalPounds ?? 0;
                    const amount = stats?.amount ?? 0;
                    const discount = stats?.discount ?? 0;

                    return (
                      <tr key={student.studentId || studentNumber} className="h-[25px]">
                        <td className="border border-black px-1 py-0.5 text-center text-black">
                          {studentNumber}
                        </td>
                        <td className="border border-black px-1 py-0.5 text-center font-mono text-black">
                          {student.studentId.replace(/\u200B/g, "")}
                        </td>
                        <td className="border border-black px-2 py-0.5 text-left text-black">
                          <AutoShrinkText
                            text={student.studentName}
                            maxFontSize={11}
                            minFontSize={8.5}
                          />
                        </td>
                        <td className="border border-black px-1 py-0.5 text-center font-normal text-black">
                          {pounds > 0 ? pounds.toLocaleString() : ""}
                        </td>
                        <td className="border border-black px-1 py-0.5 text-center font-normal text-black">
                          {amount > 0 ? amount.toLocaleString() : ""}
                        </td>
                        <td className="border border-black px-1 py-0.5 text-center font-normal text-black">
                          {discount > 0 ? discount.toLocaleString() : ""}
                        </td>
                        <td className="border border-black px-1 py-0.5 text-center text-black"></td>
                        <td className="border border-black px-1 py-0.5 text-center text-black border-r border-r-black"></td>
                      </tr>
                    );
                  })}
                </tbody>
                {isLastPage && (
                  <tfoot>
                    <tr className="font-bold bg-white text-black h-[26px]">
                      <td
                        colSpan={3}
                        className="border border-black px-2 py-0.5 text-center font-bold"
                      >
                        รวมทั้งสิ้น
                      </td>
                      <td className="border border-black px-1 py-0.5 text-center font-bold">
                        {totalPoundsSum > 0 ? totalPoundsSum.toLocaleString() : ""}
                      </td>
                      <td className="border border-black px-1 py-0.5 text-center font-bold">
                        {totalAmountSum > 0 ? totalAmountSum.toLocaleString() : ""}
                      </td>
                      <td className="border border-black px-1 py-0.5 text-center font-bold">
                        {totalDiscountSum > 0 ? totalDiscountSum.toLocaleString() : ""}
                      </td>
                      <td className="border border-black px-1 py-0.5 text-center"></td>
                      <td className="border border-black px-1 py-0.5 text-center border-r border-r-black"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Bottom Summary & Advisor Signature (on every page) */}
            <div
              className="mt-3 text-xs text-black leading-relaxed"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <div className="space-y-0.5">
                <p>
                  จำนวนรายชื่อนักเรียน นักศึกษาทั้งสิ้น ={" "}
                  <span className="font-semibold">
                    {totalStudentsCount > 0
                      ? totalStudentsCount
                      : "................................."}
                  </span>{" "}
                  คน
                </p>
                <p>
                  จำนวนรายชื่อนักเรียน นักศึกษาที่เข้าร่วม ={" "}
                  <span className="font-semibold">
                    {participatingStudentsCount > 0
                      ? participatingStudentsCount
                      : "................................."}
                  </span>{" "}
                  คน
                </p>
                <p>
                  อัตราการเข้าร่วมโครงการ ={" "}
                  <span className="font-semibold">
                    {participatingStudentsCount > 0
                      ? participationRate
                      : "................................."}
                  </span>{" "}
                  เปอร์เซ็นต์
                </p>
              </div>

              <div className="flex justify-end mt-3">
                <div className="text-center min-w-[260px]">
                  <p>ลงชื่อ ................................................................</p>
                  <p className="mt-1 font-medium">
                    ({displayAdvisor && displayAdvisor !== "-" ? displayAdvisor : "......................................................."})
                  </p>
                  <p className="mt-0.5 text-xs">ครูที่ปรึกษา</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassroomStudentPrintReport;

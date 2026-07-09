import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClassroomCakeSummary } from "@/types/classroomCakeSummary";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface ClassroomCakeSummaryContentProps {
  summaryData: ClassroomCakeSummary[] | null;
  loading: boolean;
  error: Error | null;
}

const ClassroomCakeSummaryContent: React.FC<
  ClassroomCakeSummaryContentProps
> = ({ summaryData, loading, error }) => {
  if (loading) {
    return (
      <div className="w-full text-center">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center text-red-500">
        เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}
      </div>
    );
  }

  if (!summaryData || summaryData.length === 0) {
    return (
      <div className="w-full text-center text-muted-foreground">
        ไม่พบข้อมูลสรุปออเดอร์เค้ก
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {" "}
      {/* Container for multiple classroom summaries */}
      {summaryData.map((classroomSummary, summaryIndex) => {
        // คำนวณยอดรวม
        const totalPounds = classroomSummary.cakeSummaries.reduce(
          (sum, cake) => sum + cake.totalPounds,
          0
        );
        // const totalQuantity = classroomSummary.cakeSummaries.reduce(
        //   (sum, cake) => sum + cake.totalQuantity,
        //   0
        // ); // Use cake.totalQuantity
        const totalAmount = classroomSummary.cakeSummaries.reduce(
          (sum, cake) => sum + cake.totalAmount,
          0
        ); // Use cake.totalAmount
        const discount = 10; // ส่วนลด 10 บาท ต่อชิ้น
        const discountAmount = totalPounds * discount;
        const netAmount = totalAmount - discountAmount;

        return (
          <div
            key={`summary-block-${summaryIndex}`}
            className={`mb-4 p-4 border border-gray-200 rounded-lg ${
              summaryIndex === 0 ? "first-summary-content" : ""
            }`}
          >
            <div className="text-center text-xl font-bold">
              วิทยาลัยอาชีวศึกษานครปฐม
              <br />
              ใบสรุปยอดการสั่งจองเค้ก
            </div>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm">
                  ระดับชั้น:{" "}
                  <span className="font-semibold">
                    {classroomSummary.gradeLevelName}
                  </span>{" "}
                  ห้อง:{" "}
                  <span className="font-semibold">
                    {classroomSummary.roomNumber}
                  </span>
                </p>
                <p className="text-sm">
                  แผนกวิชา:{" "}
                  <span className="font-semibold">
                    {classroomSummary.departmentName}
                  </span>{" "}
                  ครูที่ปรึกษา:{" "}
                  <span className="font-semibold">
                    {classroomSummary.advisor}
                  </span>
                </p>
                <div className="mt-3 print:hidden">
                  <Link to="/my-classroom/$classroomId/students" params={{ classroomId: classroomSummary.classroomId }}>
                    <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Users className="w-4 h-4" /> ดูรายชื่อนักเรียน
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="border-2 border-gray-800 px-4 py-2">
                <p className="text-sm">
                  เล่มที่:{" "}
                  <span className="font-semibold">
                    {classroomSummary.bookNumberRange}
                  </span>
                </p>
                <p className="text-sm">
                  เลขที่:{" "}
                  <span className="font-semibold">
                    {classroomSummary.orderNumberRange}
                  </span>
                </p>
              </div>
            </div>

            <Table className="border-2 border-gray-800">
              <TableHeader>
                <TableRow className="border-b-2 border-gray-800">
                  <TableHead
                    className="border-r-2 border-gray-800 text-center font-bold text-black align-middle"
                    rowSpan={2}
                  >
                    เนื้อเค้ก / ราคา (บาท/ปอนด์)
                  </TableHead>
                  <TableHead
                    className="text-center font-bold text-black border-b border-gray-800"
                    colSpan={5}
                  >
                    จำนวน / ชิ้น
                  </TableHead>
                  <TableHead
                    className="border-l-2 border-gray-800 border-r-2 text-center font-bold text-black align-middle"
                    rowSpan={2}
                  >
                    รวมปอนด์
                  </TableHead>
                  <TableHead
                    className="border-l-2 border-gray-800 text-center font-bold text-black align-middle"
                    rowSpan={2}
                  >
                    รวมเป็นเงิน
                  </TableHead>
                </TableRow>
                <TableRow className="border-b-2 border-gray-800">
                  <TableHead className="border-r border-gray-800 text-center text-xs font-bold text-black">
                    1 ปอนด์
                    <br />
                    (ชิ้น)
                  </TableHead>
                  <TableHead className="border-r border-gray-800 text-center text-xs font-bold text-black">
                    2 ปอนด์
                    <br />
                    (ชิ้น)
                  </TableHead>
                  <TableHead className="border-r border-gray-800 text-center text-xs font-bold text-black">
                    3 ปอนด์
                    <br />
                    (ชิ้น)
                  </TableHead>
                  <TableHead className="border-r border-gray-800 text-center text-xs font-bold text-black">
                    4 ปอนด์
                    <br />
                    (ชิ้น)
                  </TableHead>
                  <TableHead className="border-r-2 border-gray-800 text-center text-xs font-bold text-black">
                    5 ปอนด์
                    <br />
                    (ชิ้น)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...classroomSummary.cakeSummaries]
                  .sort(
                    (a, b) => (a.pricePerPound || 0) - (b.pricePerPound || 0)
                  )
                  .map((cake, index) => (
                    <TableRow
                      key={`${classroomSummary.departmentName}-${classroomSummary.gradeLevelName}-${classroomSummary.classroomName}-${cake.productName}-${index}`}
                      className="border-b border-gray-800"
                    >
                      <TableCell className="border-r-2 border-gray-800 font-medium py-6">
                        {cake.productName}{" "}
                        {cake.pricePerPound && `${cake.pricePerPound} บาท`}
                      </TableCell>
                      <TableCell className="border-r border-gray-800 text-center py-6">
                        {cake.quantityBySize?.[1] || ""}
                      </TableCell>
                      <TableCell className="border-r border-gray-800 text-center py-6">
                        {cake.quantityBySize?.[2] || ""}
                      </TableCell>
                      <TableCell className="border-r border-gray-800 text-center py-6">
                        {cake.quantityBySize?.[3] || ""}
                      </TableCell>
                      <TableCell className="border-r border-gray-800 text-center py-6">
                        {cake.quantityBySize?.[4] || ""}
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-800 text-center py-6">
                        {cake.quantityBySize?.[5] || ""}
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-800 text-center font-semibold py-6">
                        {cake.totalPounds}
                      </TableCell>
                      <TableCell className="text-center font-semibold py-6">
                        {cake.totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow className="border-b-2 border-gray-800 bg-gray-50">
                  <TableCell
                    className="border-r-2 border-gray-800 text-right font-bold py-4"
                    colSpan={6}
                  >
                    รวม
                  </TableCell>
                  <TableCell className="border-r-2 border-gray-800 text-center font-bold py-4">
                    {totalPounds}
                  </TableCell>
                  <TableCell className="text-center font-bold py-4">
                    {totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b-2 border-gray-800">
                  <TableCell
                    className="border-r-2 border-gray-800 text-right font-medium py-3"
                    colSpan={6}
                  >
                    ส่วนลด (10 บาท x {totalPounds} ปอนด์)
                  </TableCell>
                  <TableCell className="border-r-2 border-gray-800 text-center py-3">
                    {totalPounds}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    {discountAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-100">
                  <TableCell
                    className="border-r-2 border-gray-800 text-right font-bold py-3"
                    colSpan={7}
                  >
                    สุทธิชำระ
                  </TableCell>
                  <TableCell className="text-center font-bold py-3 text-lg">
                    {netAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p>
                  ยอดรวมสุทธิชำระ{" "}
                  <span className="font-semibold">
                    {netAmount.toLocaleString()}
                  </span>{" "}
                  บาท
                </p>
              </div>
              <div>
                <p>
                  เงินมัดจำ{" "}
                  <span className="font-semibold">
                    {(classroomSummary.depositAmount || 0).toLocaleString()}
                  </span>{" "}
                  บาท
                </p>
              </div>
              <div>
                <p>
                  ยอดค้างชำระ{" "}
                  <span className="font-semibold">
                    {(
                      netAmount - (classroomSummary.depositAmount || 0)
                    ).toLocaleString()}
                  </span>{" "}
                  บาท
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-between text-sm">
              <div className="text-center">
                <p>ผู้ส่งเงินมัดจำ ....................................</p>
                <p className="mt-1">({classroomSummary.advisor})</p>
                <p className="mt-1">(ครูที่ปรึกษา)</p>
              </div>
              <div className="text-center">
                <p>ผู้รับเงินมัดจำ ....................................</p>
                <p className="mt-1">(ฝ่ายการเงินและบัญชี)</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassroomCakeSummaryContent;

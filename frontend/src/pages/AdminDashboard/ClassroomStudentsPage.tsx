import React, { useEffect, useState } from "react";
import {
  getClassrooms,
  getStudentsCakePounds,
  updateClassroom,
} from "../../utils/api/classrooms";
import type { Classroom } from "../../types/classroom";
import type { Order } from "../../types/order";
import { getOrdersByClassroom } from "../../utils/api/orders";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Printer,
  UserPlus,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { useParams } from "@tanstack/react-router";
import ClassroomStudentsPageSkeleton from "../../components/dashboard/skeletons/ClassroomStudentsPageSkeleton";
import ClassroomStudentPrintReport from "../../components/dashboard/reports/ClassroomStudentPrintReport";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { useClassroomCakeSummaries } from "@/hooks/useClassroomCakeSummaries";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import Swal from "sweetalert2";
import "../../styles/print.css";

interface StudentCakeData {
  studentId: string;
  studentName: string;
  totalPounds: number;
}

const ClassroomStudentsPage: React.FC = () => {
  const { classroomId } = useParams({
    from: "/dashboard/classrooms/$classroomId/students",
  });
  const id = classroomId;
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [studentsCakeData, setStudentsCakeData] = useState<{
    students: StudentCakeData[];
    totalPoundsForClassroom: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    studentName: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [classroomOrders, setClassroomOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    summaryData: cakeSummaryData,
    loading: cakeSummaryLoading,
    error: cakeSummaryError,
  } = useClassroomCakeSummaries(false, id);

  const fetchClassroomDetailsAndCakeData = async () => {
    if (!id) {
      setError("Classroom ID is missing.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [classroomResponse, rawCakeData, orders] = await Promise.all([
        getClassrooms(1, 9999),
        getStudentsCakePounds(id),
        getOrdersByClassroom(id),
      ]);

      const foundClassroom = classroomResponse.data.find(
        (cls: Classroom) => cls.id === id,
      );

      if (foundClassroom) {
        setClassroom(foundClassroom);
        const transformedCakeData = {
          ...rawCakeData,
          students: rawCakeData.students.map((student) => ({
            studentId: student.number,
            studentName: student.name,
            totalPounds: student.totalPounds,
          })),
        };
        setStudentsCakeData(transformedCakeData);
        setClassroomOrders(orders);
      } else {
        setError("Classroom not found.");
      }
    } catch (err) {
      console.error("Error fetching classroom details or cake data:", err);
      setError("Failed to load classroom details or cake data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentName: string) => {
    const normalize = (str: string) => (str || '').replace(/\s+/g, '').trim();

    const targetName = studentName.trim();
    const normalizedTarget = normalize(targetName);

    // 1. ลองหาแบบตรงตัว หรือแบบกึ่งตรงตัว (Normalized)
    let studentOrders = classroomOrders.filter((order) => {
      if (!order.customerName) return false;
      const orderName = order.customerName.trim();
      return orderName === targetName || normalize(orderName) === normalizedTarget;
    });

    // 2. ถ้าไม่เจอ ลองแยกชื่อ-นามสกุล แล้วค้นหาทีละส่วน (เผื่อคำนำหน้าไม่ตรงกัน)
    if (studentOrders.length === 0) {
      const nameParts = targetName.split(/\s+/).filter(part => part.length > 2);

      studentOrders = classroomOrders.filter((order) => {
        if (!order.customerName) return false;
        const normalizedOrder = normalize(order.customerName);
        return nameParts.some(part => normalizedOrder.includes(normalize(part)));
      });
    }

    if (studentOrders.length > 0) {
      setSelectedOrder(studentOrders[0]);
    } else {
      showToastError({
        title: "ไม่พบข้อมูลการสั่งซื้อ",
        text: `ไม่พบข้อมูลการสั่งซื้อสำหรับนักเรียน: ${studentName}`,
      });
    }
  };

  useEffect(() => {
    fetchClassroomDetailsAndCakeData();
  }, [id]);

  const handleAddStudent = async () => {
    if (!newStudent.studentId || !newStudent.studentName) {
      showToastError({
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกรหัสนักเรียนและชื่อ-นามสกุล",
      });
      return;
    }

    if (!classroom) return;

    try {
      setIsSaving(true);
      const currentStudents = classroom.students || [];
      const updatedStudents = [...currentStudents, newStudent];

      await updateClassroom(classroom.id, {
        students: updatedStudents,
      });

      showToastSuccess({ title: "สำเร็จ", text: "เพิ่มนักเรียนเรียบร้อยแล้ว" });
      setNewStudent({ studentId: "", studentName: "" });
      setIsAddingStudent(false);
      fetchClassroomDetailsAndCakeData();
    } catch (err) {
      console.error("Error adding student:", err);
      showToastError({ title: "ผิดพลาด", text: "ไม่สามารถเพิ่มนักเรียนได้" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!classroom) return;

    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อนักเรียนคนนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        setIsSaving(true);
        const updatedStudents = (classroom.students || []).filter(
          (s) => s.studentId !== studentId,
        );

        await updateClassroom(classroom.id, {
          students: updatedStudents,
        });

        showToastSuccess({ title: "สำเร็จ", text: "ลบนักเรียนเรียบร้อยแล้ว" });
        fetchClassroomDetailsAndCakeData();
      } catch (err) {
        console.error("Error deleting student:", err);
        showToastError({ title: "ผิดพลาด", text: "ไม่สามารถลบนักเรียนได้" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditStudentName = async (
    studentId: string,
    currentName: string,
  ) => {
    const { value: newName } = await Swal.fire({
      title: "แก้ไขชื่อนักเรียน",
      input: "text",
      inputValue: currentName,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "กรุณากรอกชื่อนักเรียน";
        }
      },
    });

    if (newName && newName !== currentName && classroom) {
      try {
        setIsSaving(true);
        const updatedStudents = (classroom.students || []).map((s) =>
          s.studentId === studentId ? { ...s, studentName: newName } : s,
        );

        await updateClassroom(classroom.id, {
          students: updatedStudents,
        });

        showToastSuccess({
          title: "สำเร็จ",
          text: "แก้ไขชื่อนักเรียนเรียบร้อยแล้ว",
        });
        fetchClassroomDetailsAndCakeData();
      } catch (err) {
        console.error("Error updating student name:", err);
        showToastError({
          title: "ผิดพลาด",
          text: "ไม่สามารถแก้ไขชื่อนักเรียนได้",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePrintCakeSummary = () => {
    const printContent = document.getElementById(
      "printable-classroom-cake-summary-section",
    );
    const originalContents = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  if (loading || cakeSummaryLoading) {
    return <ClassroomStudentsPageSkeleton />;
  }

  if (error || cakeSummaryError) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        <p>
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error || cakeSummaryError?.message}
        </p>
        <Button onClick={() => window.history.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
        </Button>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container mx-auto p-4">
        <p>ไม่พบข้อมูลห้องเรียน</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
        </Button>
      </div>
    );
  }

  return (
    <div className="classroom-students-page container max-w-11/12 mx-auto p-4">
      {/* Screen-only content */}
      <div className="screen-only">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="w-fit text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้าห้องเรียน
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsAddingStudent(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            >
              <UserPlus className="mr-2 h-4 w-4" /> เพิ่มนักเรียนรายบุคคล
            </Button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-2 border-slate-200 dark:border-slate-800"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">รายชื่อนักเรียน</span>
              </Button>
              <Button
                onClick={handlePrintCakeSummary}
                variant="outline"
                className="gap-2 border-slate-200 dark:border-slate-800"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">สรุปยอดเค้ก</span>
              </Button>
            </div>
          </div>
        </div>

        {isAddingStudent && (
          <div className="mb-8 flex flex-col md:flex-row items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full md:w-48">
              <Input
                placeholder="รหัสนักเรียน"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={newStudent.studentId}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, studentId: e.target.value })
                }
              />
            </div>

            <div className="w-full md:flex-1">
              <Input
                placeholder="ชื่อ-นามสกุลนักเรียน"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={newStudent.studentName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, studentName: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={handleAddStudent}
                disabled={isSaving}
                className="flex-1 md:flex-none bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6"
              >
                เพิ่ม
              </Button>

              <Button
                onClick={() => setIsAddingStudent(false)}
                variant="ghost"
                className="text-slate-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4">
          รายชื่อนักเรียนในห้อง: {classroom.name} {classroom.department?.name}{" "}
          {classroom.grade_level
            ? `${classroom.grade_level.level === "VOCATIONAL"
              ? "ปวช."
              : classroom.grade_level.level === "HIGHER"
                ? "ปวส."
                : classroom.grade_level.level
            } ${classroom.grade_level.year}`
            : "ไม่ระบุระดับชั้น"}{" "}
          นักเรียนทั้งหมด{" "}
          {studentsCakeData ? studentsCakeData.students.length : 0} คน
        </h1>

        {studentsCakeData && studentsCakeData.students.length > 0 ? (
          <div id="printable-classroom-students-section-screen">
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
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
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b border-r border-gray-300">
                      จำนวนเค้ก (ปอนด์)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-300 w-32">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentsCakeData.students.map((student, index) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-gray-50 group"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-300">
                        {student.studentId}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-300 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => handleStudentClick(student.studentName)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                            {student.studentName}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStudentName(
                                student.studentId,
                                student.studentName,
                              );
                            }}
                            className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium border-b border-r border-gray-300">
                        {student.totalPounds}
                      </td>
                      <td className="px-4 py-3 text-sm text-center border-b border-gray-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.studentId)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-sm text-gray-900 text-right border-r border-gray-300"
                    >
                      รวมจำนวนปอนด์นักเรียนทุกคนในห้อง:
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right border-r border-gray-300">
                      {studentsCakeData.totalPoundsForClassroom} ปอนด์
                    </td>
                    <td className="bg-gray-100 border-b border-gray-300"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-4">
            ไม่มีนักเรียนในห้องเรียนนี้ หรือไม่มีข้อมูลเค้ก
          </p>
        )}

        {/* Cake Summary Content */}
        <div className="mt-8 border-t pt-8">
          <div id="printable-classroom-cake-summary-section" className="w-full">
            <ClassroomCakeSummaryContent
              summaryData={cakeSummaryData}
              loading={cakeSummaryLoading}
              error={cakeSummaryError}
            />
          </div>
        </div>
      </div>

      {/* Print-only content */}
      {classroom && studentsCakeData && (
        <ClassroomStudentPrintReport
          classroom={classroom}
          studentsCakeData={studentsCakeData}
          printId="printable-classroom-students-section"
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default ClassroomStudentsPage;

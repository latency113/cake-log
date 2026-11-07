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
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "@tanstack/react-router";
import ClassroomStudentsPageSkeleton from "../../components/dashboard/skeletons/ClassroomStudentsPageSkeleton";
import ClassroomStudentPrintReport from "../../components/dashboard/reports/ClassroomStudentPrintReport";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { useClassroomCakeSummaries } from "@/hooks/useClassroomCakeSummaries";
import {
  showToastSuccess,
  showToastError,
  showConfirmDialog,
  showAlertSuccess,
  showAlertError,
  showAlertInfo,
} from "@/utils/alerts";
import { finalizeClassroom } from "@/utils/api/data";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";
import { printSection } from "@/utils/printUtils";
import "../../styles/print.css";

interface StudentCakeData {
  studentId: string;
  studentName: string;
  totalPounds: number;
  isManuallyAdded?: boolean;
}

const ClassroomStudentsPage: React.FC = () => {
  const { classroomId } = useParams({
    strict: false,
  }) as any;
  const id = classroomId;
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [isFinalizing, setIsFinalizing] = useState(false);
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
            isManuallyAdded: student.number.includes("\u200B"),
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
      const studentToPush = {
        studentId: newStudent.studentId.trim() + "\u200B",
        studentName: newStudent.studentName.trim(),
      };
      const updatedStudents = [...currentStudents, studentToPush];

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

  const academicYear =
    localStorage.getItem("academicYear") ||
    (new Date().getFullYear() + 543).toString();

  const advisorName =
    classroom?.teacher
      ? classroom.teacher.name
      : cakeSummaryData?.[0]?.advisor || "";

  const handlePrintStudents = () => {
    if (!isFinalized) {
      showAlertInfo({
        title: "ยังไม่ได้สรุปยอดเค้ก",
        text: "กรุณากด 'สรุปยอดเค้ก' เพื่อยืนยันและสรุปยอดข้อมูลของห้องเรียนนี้ก่อนพิมพ์รายงาน",
      });
      return;
    }

    const gradeLevel = classroom?.grade_level
      ? `${
          classroom.grade_level.level === "VOCATIONAL"
            ? "ปวช."
            : classroom.grade_level.level === "HIGHER"
            ? "ปวส."
            : classroom.grade_level.level
        } ${classroom.grade_level.year}`
      : "";
    const title = `รายชื่อนักเรียน_${gradeLevel}_ห้อง_${classroom?.name || ""}`;
    printSection(
      "printable-classroom-students-section",
      title,
      {
        orientation: "portrait",
        paperSize: "A4",
        scale: 0.96,
        margin: "6mm 10mm 6mm 10mm",
        customStyles: `
          @page {
            size: A4 portrait !important;
            margin: 6mm 10mm 6mm 10mm !important;
          }
          body {
            font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            color: #000 !important;
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-classroom-students-section {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only {
            display: block !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          th, td {
            border: 1px solid #000 !important;
          }
          th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          tfoot tr {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        `,
      }
    );
  };

  const handlePrintCakeSummary = () => {
    if (!isFinalized) {
      showAlertInfo({
        title: "ยังไม่ได้สรุปยอดเค้ก",
        text: "กรุณากด 'สรุปยอดเค้ก' เพื่อยืนยันและสรุปยอดข้อมูลของห้องเรียนนี้ก่อนพิมพ์รายงาน",
      });
      return;
    }

    printSection(
      "printable-classroom-cake-summary-section",
      "ใบสรุปยอดการสั่งจองเค้ก",
      {
        orientation: "portrait",
        paperSize: "A4",
        scale: 1,
        margin: "10mm",
        customStyles: `
          .print\\:hidden { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; box-sizing: border-box !important; }
          th:last-child, td:last-child { border-right: 2px solid #1f2937 !important; }
          th:first-child, td:first-child { border-left: 2px solid #1f2937 !important; }
        `,
      }
    );
  };

  const isFinalized = Boolean(
    classroom?.isOrderFinalized || cakeSummaryData?.[0]?.isOrderFinalized
  );

  const handleFinalizeClassroom = async () => {
    if (!id || !classroom) return;

    const isConfirmed = await showConfirmDialog({
      title: "ยืนยันการสรุปยอดเค้ก?",
      text: "เมื่อสรุปยอดแล้ว คุณจะไม่สามารถเพิ่มหรือแก้ไขออเดอร์ของห้องเรียนนี้ได้อีก ยืนยันที่จะดำเนินการต่อหรือไม่?",
      confirmButtonText: "ยืนยัน, สรุปยอด",
      cancelButtonText: "ยกเลิก",
    });

    if (isConfirmed) {
      try {
        setIsFinalizing(true);
        await finalizeClassroom(id);
        showAlertSuccess({
          title: "สำเร็จ!",
          text: "สรุปยอดเค้กของห้องเรียนเรียบร้อยแล้ว",
        });
        fetchClassroomDetailsAndCakeData();
      } catch (err) {
        console.error(err);
        showAlertError({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถสรุปยอดได้ กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setIsFinalizing(false);
      }
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
          <Button
            onClick={() => {
              if (window.location.pathname.startsWith("/my-classroom")) {
                navigate({ to: "/classroom" });
              } else {
                window.history.back();
              }
            }}
            variant="ghost"
            className="w-fit text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้าห้องเรียน
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            {/* Finalize Button / Finalized Badge */}
            {!isFinalized ? (
              <Button
                onClick={handleFinalizeClassroom}
                disabled={isFinalizing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20 gap-2 font-medium"
              >
                <Lock className="h-4 w-4" />
                <span>สรุปยอดเค้ก</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>สรุปยอดเค้กแล้ว</span>
              </div>
            )}

            {!isFinalized && (
              <Button
                onClick={() => setIsAddingStudent(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                <UserPlus className="mr-2 h-4 w-4" /> เพิ่มนักเรียนรายบุคคล
              </Button>
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handlePrintStudents}
                variant="outline"
                disabled={!isFinalized}
                className={`gap-2 border-slate-200 dark:border-slate-800 ${
                  !isFinalized ? "opacity-40 cursor-not-allowed" : ""
                }`}
                title={
                  isFinalized
                    ? "พิมพ์รายชื่อนักเรียน (แนวตั้ง A4)"
                    : "กรุณากดสรุปยอดเค้กก่อนพิมพ์รายงาน"
                }
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">รายชื่อนักเรียน</span>
              </Button>
              <Button
                onClick={handlePrintCakeSummary}
                variant="outline"
                disabled={!isFinalized}
                className={`gap-2 border-slate-200 dark:border-slate-800 ${
                  !isFinalized ? "opacity-40 cursor-not-allowed" : ""
                }`}
                title={
                  isFinalized
                    ? "พิมพ์สรุปยอดเค้กของห้องเรียน (A4 แนวตั้ง)"
                    : "กรุณากดสรุปยอดเค้กก่อนพิมพ์รายงาน"
                }
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">สรุปยอดเค้ก</span>
              </Button>

              {!isFinalized && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>ต้องสรุปยอดเค้กก่อนจึงจะพิมพ์รายงานได้</span>
                </span>
              )}
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
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6"
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
                        {student.studentId.replace(/\u200B/g, "")}
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
                        {(user?.role === "SUPERADMIN" || student.studentId.includes("\u200B")) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.studentId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
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
          academicYear={academicYear}
          advisorName={advisorName}
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

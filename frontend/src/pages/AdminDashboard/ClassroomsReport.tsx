import { useState, useEffect, useMemo } from "react";
import { Home, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getStudentsCakePounds,
  importClassroomsFromExcel, // Import the new API function
} from "@/utils/api/classrooms";
import { getTeachers } from "@/utils/api/teachers";
import ClassroomTable from "@/components/classrooms/ClassroomTable";
import ClassroomFormModal from "@/components/classrooms/ClassroomFormModal";
import ClassroomDeleteConfirmModal from "@/components/classrooms/ClassroomDeleteConfirmModal";
import ClassroomsPagination from "@/components/classrooms/ClassroomsPagination";
import ClassroomEditFormModal from "@/components/classrooms/ClassroomEditFormModal";
import { getDepartments } from "@/utils/api/departments";
import { getCakeSettings, createCakeSettings } from "@/utils/api/settings"; // Import getCakeSettings and createCakeSettings
import type { ICakeSettings } from "@/types/cake"; // Import ICakeSettings
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // New import
import ClassroomsSkeleton from "../../components/dashboard/skeletons/ClassroomsSkeleton";
import "../../styles/print.css";
import ClassroomCakeSummaryPrintReport from "@/components/dashboard/reports/ClassroomCakeSummaryPrintReport"; // Import the print report component
import { useClassroomCakeSummaries } from "@/hooks/useClassroomCakeSummaries"; // Import the hook
import type { Classroom, Department } from "@/types";
import { printSection } from "@/utils/printUtils"; // Import printSection

// Define the stats interface to be used in this component and passed down
interface ClassroomStats {
  totalPounds: number;
  presentStudents: number;
}

const ClassroomsReport: React.FC = () => {
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);
  const [isLoadingCakeSettings, setIsLoadingCakeSettings] = useState(true);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [statsData, setStatsData] = useState<Map<string, ClassroomStats>>(
    new Map()
  );
  const [loadingStats, setLoadingStats] = useState(false);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] =
    useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReadFirstDialogOpen, setIsReadFirstDialogOpen] = useState(false); // New state
  const [teachersMap, setTeachersMap] = useState<Map<string, string>>(
    new Map()
  ); // Added teachersMap
  const [reporterName, setReporterName] = useState("นางนุจสรา โพธิ์เงิน");

  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    summaryData: allClassroomSummaryData,
    loading: loadingClassroomSummary,
    error: classroomSummaryError,
  } = useClassroomCakeSummaries(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
        if (settings?.reporterName) {
          setReporterName(settings.reporterName);
        }
      } catch (error) {
        console.error("Failed to fetch cake settings:", error);
      } finally {
        setIsLoadingCakeSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const response = await getClassrooms(1, 9999); // Fetch all
      setClassrooms(response.data);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
      setError("Failed to load classrooms.");
      showToastError({ title: "Error", text: "เกิดผิดพลาดในการดึงข้อมูล" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments(1, 9999);
      setAllDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchTeachersData = async () => {
    // Added function to fetch teachers
    try {
      const teachersData = await getTeachers();
      const newTeachersMap = new Map<string, string>();
      teachersData.forEach((teacher) =>
        newTeachersMap.set(teacher.id, teacher.name)
      );
      setTeachersMap(newTeachersMap);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchClassrooms();
    fetchTeachersData(); // Fetch teachers when component mounts
  }, []);

  useEffect(() => {
    if (classrooms.length === 0) return;

    const fetchAllStats = async () => {
      setLoadingStats(true);
      const newStatsData = new Map<string, ClassroomStats>();
      await Promise.all(
        classrooms.map(async (classroom) => {
          try {
            const data = await getStudentsCakePounds(classroom.id);
            // console.log(`Classroom ID: ${classroom.id}, totalPoundsForClassroom from API:`, data.totalPoundsForClassroom); // Debug log
            const studentsWhoOrdered = data.students.filter(
              (student) => student.totalPounds > 0
            );
            newStatsData.set(classroom.id, {
              totalPounds: data.totalPoundsForClassroom,
              presentStudents: studentsWhoOrdered.length,
            });
          } catch (error) {
            console.error(
              `Failed to fetch stats for classroom ${classroom.id}`,
              error
            );
            newStatsData.set(classroom.id, {
              totalPounds: 0,
              presentStudents: 0,
            });
          }
        })
      );
      setStatsData(newStatsData);
      setLoadingStats(false);
    };

    fetchAllStats();
  }, [classrooms]);

  const filteredClassrooms = useMemo(() => {
    const classroomsToSort = selectedDepartmentFilter
      ? classrooms.filter(
          (classroom) => classroom.department_id === selectedDepartmentFilter
        )
      : classrooms;

    return [...classroomsToSort].sort((a, b) => {
      // 1. Sort by Department Name
      const departmentA =
        allDepartments.find((dep) => dep.id === a.department_id)?.name || "";
      const departmentB =
        allDepartments.find((dep) => dep.id === b.department_id)?.name || "";

      if (departmentA !== departmentB) {
        return departmentA.localeCompare(departmentB, "th");
      }

      // 2. Sort by Grade Level Type (VOCATIONAL before HIGHER)
      // Define order: VOCATIONAL = 1, HIGHER = 2, Others/Undefined = 99
      const getLevelOrder = (level?: "VOCATIONAL" | "HIGHER") => {
        if (level === "VOCATIONAL") return 1;
        if (level === "HIGHER") return 2;
        return 99;
      };

      const levelOrderA = getLevelOrder(a.grade_level?.level);
      const levelOrderB = getLevelOrder(b.grade_level?.level);

      if (levelOrderA !== levelOrderB) {
        return levelOrderA - levelOrderB;
      }

      // 3. Sort by Grade Level Year
      const yearA = a.grade_level?.year || 0;
      const yearB = b.grade_level?.year || 0;
      if (yearA !== yearB) {
        return yearA - yearB;
      }

      // 4. Sort by Classroom Name (e.g., 1/1, 1/2, 1/10)
      const parseClassroomName = (name: string) => {
        const parts = name.split("/").map((part) => parseInt(part, 10));
        // Check if we have two valid numbers
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return { major: parts[0], minor: parts[1], isValid: true };
        }
        return { major: 0, minor: 0, isValid: false };
      };

      const nameDataA = parseClassroomName(a.name);
      const nameDataB = parseClassroomName(b.name);

      if (nameDataA.isValid && nameDataB.isValid) {
        if (nameDataA.major !== nameDataB.major) {
          return nameDataA.major - nameDataB.major;
        }
        return nameDataA.minor - nameDataB.minor;
      }

      // Fallback for non-standard names
      return a.name.localeCompare(b.name, "th", { numeric: true });
    });
  }, [classrooms, selectedDepartmentFilter, allDepartments]);

  const grandTotalPounds = useMemo(() => {
    return classrooms.reduce((total, classroom) => {
      const stats = statsData.get(classroom.id);
      return total + (stats ? stats.totalPounds : 0);
    }, 0);
  }, [classrooms, statsData]);

  const totalFilteredClassrooms = filteredClassrooms.length;

  const paginatedClassrooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClassrooms.slice(startIndex, endIndex);
  }, [filteredClassrooms, currentPage, itemsPerPage]);

  const handleEditClassroom = (classroom: Classroom) => {
    const teacherName = teachersMap.get(classroom.teacher_id);
    const classroomWithTeacherName: Classroom = {
      ...classroom,
      teacher: teacherName
        ? {
            id: classroom.teacher_id,
            name: teacherName,
            department_id: classroom.department_id,
            createdAt: "",
            updatedAt: "",
          }
        : undefined,
    };
    setSelectedClassroom(classroomWithTeacherName);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSaveClassroom = async (classroomData: Partial<Classroom>) => {
    try {
      if (selectedClassroom) {
        await updateClassroom(selectedClassroom.id, classroomData);
        showToastSuccess({ title: "Success", text: "อัพเดทห้องสำเร็จ!" });
      } else {
        await createClassroom(
          classroomData as Omit<Classroom, "id" | "createdAt" | "updatedAt">
        );
        showToastSuccess({ title: "Success", text: "สร้างห้องสำเร็จ!" });
      }
      fetchClassrooms();
      setIsFormModalOpen(false);
      return true;
    } catch (err) {
      console.error("Error saving classroom:", err);
      showToastError({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการบันทึก โปรดตรวจสอบว่ามีห้องนี้แล้วหรือยัง",
      });
      return false;
    }
  };

  const handleImportClassrooms = async (file: File): Promise<boolean> => {
    try {
      await importClassroomsFromExcel(file);
      showToastSuccess({
        title: "Success",
        text: "นำเข้าข้อมูลชั้นเรียนสำเร็จ!",
      });
      fetchClassrooms(); // Refresh the classroom list
      setIsImportModalOpen(false); // Close the import modal
      return true;
    } catch (err) {
      console.error("Error importing classrooms:", err);
      showToastError({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการนำเข้าข้อมูลชั้นเรียน",
      });
      return false;
    }
  };

  const handleDeleteConfirm = async (classroomId: string) => {
    try {
      await deleteClassroom(classroomId);
      showToastSuccess({ title: "Success", text: "ลบห้องสำเร็จ!" });
      fetchClassrooms();
      setIsDeleteConfirmModalOpen(false);
      setSelectedClassroom(null);
    } catch (err) {
      console.error("Error deleting classroom:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการลบห้อง" });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (num: number) => {
    setItemsPerPage(num);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentFilter(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handleSaveReporterName = async () => {
    try {
      await createCakeSettings({ reporterName });
      showToastSuccess({ title: "Success", text: "บันทึกชื่อผู้รายงานสำเร็จ!" });
    } catch (error) {
      console.error("Failed to save reporter name:", error);
      showToastError({ title: "Error", text: "บันทึกชื่อผู้รายงานไม่สำเร็จ" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartmentFilter]);

  const displayAcademicYear = isLoadingCakeSettings
    ? (new Date().getFullYear() + 543).toString() // Fallback while loading
    : cakeSettings?.academicYear || (new Date().getFullYear() + 543).toString();

  const displayNewYear = (parseInt(displayAcademicYear) + 1).toString();

  const handleImportStudentFileForClassroom = async (
    classroomId: string,
    file: File
  ): Promise<boolean> => {
    try {
      await updateClassroom(classroomId, { file }); // Use the existing updateClassroom API
      showToastSuccess({
        title: "Success",
        text: "นำเข้าข้อมูลนักเรียนสำเร็จ!",
      });
      fetchClassrooms(); // Explicitly refresh classrooms data
      return true;
    } catch (error) {
      console.error(
        `Error importing students for classroom ${classroomId}:`,
        error
      );
      showToastError({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการนำเข้ารายชื่อนักเรียน",
      });
      return false;
    }
  };

  if (error || classroomSummaryError) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const handlePrintClassroomSummary = () => {
    printSection("classroom-summary-print-section", "สรุปยอดเค้กของห้องเรียน", {
      orientation: "portrait",
      paperSize: "A4",
      scale: 1,
      margin: "10mm",
      customStyles: `
        @media print {
          .print\\:hidden, .screen-only {
            display: none !important;
          }
          .space-y-8 {
            margin-top: 0 !important;
          }
          .classroom-summary-card,
          #classroom-summary-print-section .space-y-8 > div,
          #printable-classroom-cake-summary-section .space-y-8 > div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .classroom-summary-card:not(.first-summary-content),
          #classroom-summary-print-section .space-y-8 > div:not(.first-summary-content),
          #printable-classroom-cake-summary-section .space-y-8 > div:not(.first-summary-content) {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
          }
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            border-collapse: collapse !important;
            box-sizing: border-box !important;
          }
          th:last-child, td:last-child {
            border-right: 2px solid #1f2937 !important;
          }
          th:first-child, td:first-child {
            border-left: 2px solid #1f2937 !important;
          }
        }
      `,
    });
  };

  const handlePrintClassroomsReport = () => {
    printSection("printable-classrooms-section", "รายงานผลการเข้าร่วมกิจกรรม", {
      orientation: "landscape",
      margin: "8mm 12mm",
      customStyles: `
        .print-table-wrapper {
          border: none !important;
          box-shadow: none !important;
        }
        .print-table-title {
          border: none !important;
          border-bottom: none !important;
          margin-bottom: 8px !important;
        }
      `,
    });
  };

  return (
    <div className="classrooms-print-page max-w-11/12 mx-auto">
      <>
        <div className="bg-gradient-to-r from-indigo-500 to-orange-500 rounded-sm shadow-md p-8 mb-8 text-white print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Home className="w-10 h-10 mr-4 text-white" />
                รายงานผล
              </h1>
              <p className="text-white text-lg">
                รายงานผลการเข้าร่วมกิจกรรมของทุกแผนก
              </p>
            </div>
            <div className="flex space-x-4 print:hidden">
              <Button
                onClick={handlePrintClassroomsReport}
                className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:bg-white dark:text-blue-600 dark:hover:bg-blue-50 dark:hover:text-blue-700 transition-colors duration-200 flex items-center font-semibold shadow-sm"
                title="พิมพ์รายงาน (จัดแนวนอนและเต็มหน้ากระดาษอัตโนมัติ)"
              >
                <Printer className="w-5 h-5 mr-2" />
                พิมพ์รายงาน
              </Button>
              <Button
                onClick={handlePrintClassroomSummary}
                id="print-classroom-summary-button"
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700 transition-colors duration-200 flex items-center font-semibold shadow-sm"
                disabled={loadingClassroomSummary} // Disable when summary data is loading
                title="พิมพ์สรุปยอดเค้กของห้องเรียน (ปรับกระดาษเป็น A4 แนวตั้งอัตโนมัติ)"
              >
                <Printer className="w-5 h-5 mr-2" />
                พิมพ์สรุปยอดเค้กของห้องเรียน
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 print:hidden flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              เลือกแผนกเพื่อแสดงชั้นเรียน
            </label>
            <Select
              onValueChange={handleDepartmentChange}
              value={
                selectedDepartmentFilter === "" ? "all" : selectedDepartmentFilter
              }
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue
                  placeholder={
                    selectedDepartmentFilter === "" ? "ทั้งหมด" : "กรุณาเลือกแผนก"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-departments" value="all">
                  ทั้งหมด
                </SelectItem>
                {allDepartments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ชื่อผู้รายงาน (แสดงท้ายรายงาน)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                className="w-[280px]"
                placeholder="ระบุชื่อผู้รายงาน"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
              />
              <Button onClick={handleSaveReporterName} size="icon" className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <ClassroomsSkeleton />
        ) : (
          <>
            <div id="printable-classrooms-section">
              {/* Normal table for screen (hidden when printing) */}
              <div className="print:hidden">
                <ClassroomTable
                  classrooms={paginatedClassrooms}
                  statsData={statsData}
                  grandTotalPounds={grandTotalPounds}
                  loadingStats={loadingStats}
                  onEdit={handleEditClassroom}
                  onDelete={handleDeleteClick}
                  displayMode="report"
                />
              </div>

              {/* Print-only table: rendered only in print media so screen layout stays normal */}
              <div className="hidden print:block">
                <ClassroomTable
                  printTitle={`รายงานการเข้าร่วมกิจกรรมการสั่งจองเค้กปีใหม่ ${displayNewYear} ใบสั่งจอง (ประจำปีการศึกษา ${displayAcademicYear})`}
                  classrooms={filteredClassrooms}
                  statsData={statsData}
                  grandTotalPounds={grandTotalPounds}
                  loadingStats={loadingStats}
                  onEdit={handleEditClassroom}
                  onDelete={handleDeleteClick}
                  isPrinting={true}
                  itemsPerPageForPrint={20}
                  printFooter="true"
                  displayMode="report"
                  reporterName={reporterName}
                />
              </div>
            </div>

            <ClassroomsPagination
              totalClassrooms={totalFilteredClassrooms}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className="print:hidden"
            />
          </>
        )}
        {/* This is the modal for importing classrooms */}
        <ClassroomFormModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onConfirm={handleImportClassrooms}
        />
        <ClassroomEditFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveClassroom}
          classroomToEdit={selectedClassroom}
          onImportStudentsFile={handleImportStudentFileForClassroom}
        />
        <ClassroomDeleteConfirmModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          classroomToDelete={selectedClassroom}
        />

        <ClassroomCakeSummaryPrintReport
          summaryData={allClassroomSummaryData}
          loading={loadingClassroomSummary}
          error={classroomSummaryError}
          printId="classroom-summary-print-section"
        />

        {/* "โปรดอ่านก่อน" Dialog */}
        <Dialog
          open={isReadFirstDialogOpen}
          onOpenChange={setIsReadFirstDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>ข้อแนะนำการพิมพ์รายงาน</DialogTitle>
              <DialogDescription>
                <p className="text-base text-emerald-600 font-semibold mb-2">
                  ระบบตั้งค่าแนวนอนและขยายตารางเต็มหน้ากระดาษให้อัตโนมัติแล้ว!
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md space-y-2 text-sm border">
                  <div>
                    <span className="font-medium text-blue-600">ปุ่มสีน้ำเงิน (พิมพ์รายงาน):</span>
                    <p className="text-muted-foreground ml-2">• ปรับเป็นแนวนอน (Landscape) และตารางขยายเต็มหน้ากระดาษพอดี 20 แถวต่อหน้า</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">ปุ่มสีเขียว (สรุปยอดเค้กห้องเรียน):</span>
                    <p className="text-muted-foreground ml-2">• ปรับเป็นแนวตั้ง (Portrait) ขนาด A4 และตารางขยายเต็มหน้ากระดาษ</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * ในหน้าต่างพิมพ์ (Print Preview) ท่านสามารถเลือกมาตราส่วน (Scale) เป็น "ค่าเริ่มต้น (Default)" หรือ "100%" ได้ทันที ตารางจะแสดงเต็มหน้ากระดาษสวยงาม
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setIsReadFirstDialogOpen(false)}>
                เข้าใจแล้ว
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
};

export default ClassroomsReport;

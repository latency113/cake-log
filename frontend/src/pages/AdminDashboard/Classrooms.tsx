import { useState, useEffect, useMemo } from "react";
import { Home, Rocket, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToastSuccess, showToastError } from "@/utils/alerts";
// ... (rest of the imports)
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getStudentsCakePounds,
  promoteClassrooms,
  importClassroomsFromExcel, // Import the new API function
} from "@/utils/api/classrooms";
import { getTeachers } from "@/utils/api/teachers";
import ClassroomTable from "@/components/classrooms/ClassroomTable";
import ClassroomFormModal from "@/components/classrooms/ClassroomFormModal";
import ClassroomDeleteConfirmModal from "@/components/classrooms/ClassroomDeleteConfirmModal";
import ClassroomsPagination from "@/components/classrooms/ClassroomsPagination";
import ClassroomEditFormModal from "@/components/classrooms/ClassroomEditFormModal";
import { getDepartments } from "@/utils/api/departments";
import { getCakeSettings } from "../../utils/api/settings"; // Import getCakeSettings
import type { ICakeSettings } from "../../types/cake"; // Import ICakeSettings
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Outlet, useRouterState } from "@tanstack/react-router";
import ClassroomsSkeleton from "../../components/dashboard/skeletons/ClassroomsSkeleton";
import Swal from "sweetalert2"; // Import SweetAlert2
import '../../styles/print.css'
import type { Classroom, Department } from "@/types";

// Define the stats interface to be used in this component and passed down
interface ClassroomStats {
  totalPounds: number;
  presentStudents: number;
}

const Classrooms: React.FC = () => {
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);
  const [isLoadingCakeSettings, setIsLoadingCakeSettings] = useState(true);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [statsData, setStatsData] = useState<Map<string, ClassroomStats>>(new Map());
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
  const [teachersMap, setTeachersMap] = useState<Map<string, string>>(new Map()); // Added teachersMap

  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { location } = useRouterState();
  const isClassroomsIndex = location.pathname === "/dashboard/classrooms";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
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

  const fetchTeachersData = async () => { // Added function to fetch teachers
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
      teacher: teacherName ? { id: classroom.teacher_id, name: teacherName, department_id: classroom.department_id, createdAt: '', updatedAt: '' } : undefined,
    };
    setSelectedClassroom(classroomWithTeacherName);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsDeleteConfirmModalOpen(true);
  };

  const handlePromoteClick = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการเลื่อนชั้นปี",
      text: "คุณแน่ใจหรือไม่ว่าต้องการเลื่อนชั้นปีทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้. นักเรียนและชั้นเรียนจะถูกอัพเดทไปยังปีการศึกษาถัดไป.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, เลื่อนชั้นปี!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กำลังเลื่อนชั้นปี กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const promoteResult = await promoteClassrooms();
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: promoteResult.message,
          showConfirmButton: false,
          timer: 1500,
        });
        fetchClassrooms(); // Refetch classrooms after promotion
        setStatsData(new Map()); // Clear stats data to re-fetch
      } catch (err: any) {
        console.error("Error promoting classrooms:", err);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด!",
          text: err.response?.data?.error || "เกิดข้อผิดพลาดในการเลื่อนชั้นปี",
        });
      }
    }
  };

  // const handleRevertPromoteClick = async () => {
  //   const result = await Swal.fire({
  //     title: "ยืนยันการย้อนกลับ",
  //     text: "คุณแน่ใจหรือไม่ว่าต้องการย้อนกลับการเลื่อนชั้นปี? ระบบจะกู้คืนข้อมูลจากข้อมูลสำรองล่าสุด. การดำเนินการนี้อาจทำให้ข้อมูลปัจจุบันบางส่วนหายไป.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "ใช่, ย้อนกลับ!",
  //     cancelButtonText: "ยกเลิก",
  //     reverseButtons: true,
  //   });

  //   if (result.isConfirmed) {
  //     Swal.fire({
  //       title: "กำลังดำเนินการ...",
  //       text: "กำลังกู้คืนข้อมูล กรุณารอสักครู่",
  //       allowOutsideClick: false,
  //       didOpen: () => {
  //         Swal.showLoading();
  //       },
  //     });

  //     try {
  //       const restoreResult = await restorePrePromotionBackup();
  //       Swal.fire({
  //         icon: "success",
  //         title: "สำเร็จ!",
  //         text: restoreResult.message || "กู้คืนข้อมูลสำเร็จแล้ว!",
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //       // Reload the page to ensure all data contexts are refreshed
  //       window.location.reload(); 
  //     } catch (err: any) {
  //       console.error("Error during restore:", err);
  //       Swal.fire({
  //         icon: "error",
  //         title: "ข้อผิดพลาด!",
  //         text: err.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการกู้คืนข้อมูล",
  //       });
  //     }
  //   }
  // };

  const handleSaveClassroom = async (
    classroomData: Partial<Classroom>
  ) => {
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

  const handleImportStudentsForClassroom = async (classroomId: string, file: File): Promise<boolean> => {
    try {
      await updateClassroom(classroomId, { file: file });
      showToastSuccess({ title: "Success", text: "นำเข้าข้อมูลนักเรียนสำเร็จ!" });
      fetchClassrooms(); // Refresh classrooms data to show updated student counts
      return true;
    } catch (err) {
      console.error("Error importing students for classroom:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการนำเข้าข้อมูลนักเรียน" });
      return false;
    }
  };

  const handleImportClassrooms = async (file: File): Promise<boolean> => {
    try {
      await importClassroomsFromExcel(file);
      showToastSuccess({ title: "Success", text: "นำเข้าข้อมูลชั้นเรียนสำเร็จ!" });
      fetchClassrooms(); // Refresh the classroom list
      setIsImportModalOpen(false); // Close the import modal
      return true;
    } catch (err) {
      console.error("Error importing classrooms:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการนำเข้าข้อมูลชั้นเรียน" });
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartmentFilter]);

  const displayAcademicYear = isLoadingCakeSettings
    ? (new Date().getFullYear() + 543).toString() // Fallback while loading
    : cakeSettings?.academicYear || (new Date().getFullYear() + 543).toString();

  const displayNewYear = (parseInt(displayAcademicYear) + 1).toString();

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="classrooms-print-page max-w-11/12 mx-auto">
      {isClassroomsIndex ? (
        <>
          <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-sm shadow-md p-8 mb-8 text-white print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center">
                  <Home className="w-10 h-10 mr-4 text-white" />
                  จัดการชั้นเรียน
                </h1>
                <p className="text-white text-lg">รายการชั้นเรียนทั้งหมด</p>
              </div>
              <div className="flex space-x-4 print:hidden">
                {/* <Button
                  onClick={handleRevertPromoteClick}
                  className="bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center"
                >
                  <Undo2 className="w-5 h-5 mr-2" />
                  ย้อนกลับการเลื่อนชั้นปี
                </Button> */}
                <Button
                  onClick={handlePromoteClick}
                  className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 flex items-center"
                >
                <Rocket className="w-5 h-5 mr-2" />
                  เลื่อนชั้นปี
                </Button>

                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 flex items-center"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  นำเข้า Excel
                </Button>

              </div>
            </div>
          </div>

          <div className="mb-6 print:hidden">
            <label className="block text-sm font-medium text-foreground mb-2">
              เลือกแผนกเพื่อแสดงชั้นเรียน
            </label>
            <Select
              onValueChange={handleDepartmentChange}
              value={selectedDepartmentFilter === "" ? "all" : selectedDepartmentFilter}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={selectedDepartmentFilter === "" ? "ทั้งหมด" : "กรุณาเลือกแผนก"} />
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
                    displayMode="management"
                  />
                </div>

                {/* Print-only table: rendered only in print media so screen layout stays normal */}
                <div className="hidden print:block">
                  <ClassroomTable
                    printTitle={`รายงานการเข้าร่วมกิจกรรมการสั่งจองเค้กปีใหม่ ${displayNewYear} ใบสั่งจอง (ประจำปีการศึกษา ${displayAcademicYear})`}
                    classrooms={paginatedClassrooms}
                    statsData={statsData}
                    grandTotalPounds={grandTotalPounds}
                    loadingStats={loadingStats}
                    onEdit={handleEditClassroom}
                    onDelete={handleDeleteClick}
                    isPrinting={true}
                    itemsPerPageForPrint={20}
                    printFooter="true"
                    displayMode="management"
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
            onImportStudentsFile={handleImportStudentsForClassroom}
            classroomToEdit={selectedClassroom}
          />
          <ClassroomDeleteConfirmModal
            isOpen={isDeleteConfirmModalOpen}
            onClose={() => setIsDeleteConfirmModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            classroomToDelete={selectedClassroom}
          />
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Classrooms;
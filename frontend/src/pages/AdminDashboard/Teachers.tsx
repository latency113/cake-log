import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import type { Teacher, Department } from "@/types";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/utils/api/teachers";
import TeacherTable from "@/components/teachers/TeacherTable";
import TeacherFormModal from "@/components/teachers/TeacherFormModal";
import TeacherDeleteConfirmModal from "@/components/teachers/TeacherDeleteConfirmModal";
import TeachersPagination from "@/components/teachers/TeachersPagination";
import { getDepartments } from "@/utils/api/departments";
import TeachersSkeleton from "../../components/dashboard/skeletons/TeachersSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Teachers: React.FC = () => {
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // Stores all teachers from API
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all");

  const fetchAllTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers(); // Fetch all teachers
      setAllTeachers(data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to load teachers.");
      showToastError({ title: "Error", text: "Failed to load teachers." });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDepartments = async () => {
    try {
      const response = await getDepartments(1, 9999); // Fetch all departments
      setAllDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchAllTeachers();
    fetchAllDepartments();
  }, []); // Fetch all data once on mount

  const filteredTeachers = useMemo(() => {
    let filtered = allTeachers;

    if (selectedDepartmentFilter !== "all") {
      filtered = filtered.filter(teacher => teacher.department_id === selectedDepartmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        teacher =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [allTeachers, selectedDepartmentFilter, searchTerm]);

  const totalFilteredTeachers = filteredTeachers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  const handleAddTeacherClick = () => {
    setSelectedTeacher(null);
    setIsFormModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSaveTeacher = async (teacherData: Omit<Teacher, 'id'> | Teacher) => {
    try {
      if (selectedTeacher) {
        await updateTeacher(selectedTeacher.id, teacherData);
        showToastSuccess({ title: "Success", text: "อัพเดทข้อมูลครูสำเร็จ!" });
      } else {
        await createTeacher(teacherData as Omit<Teacher, 'id'>);
        showToastSuccess({ title: "Success", text: "สร้างข้อมูลครูสำเร็จ!" });
      }
      fetchAllTeachers(); // Re-fetch all teachers to update the list
      setIsFormModalOpen(false);
      return true;
    } catch (err) {
      console.error("Error saving teacher:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการบันทึก" });
      return false;
    }
  };

  const handleDeleteConfirm = async (teacherId: string) => {
    try {
      await deleteTeacher(teacherId);
      showToastSuccess({ title: "Success", text: "ลบข้อมูลครูสำเร็จ!" });
      fetchAllTeachers(); // Re-fetch all teachers to update the list
      setIsDeleteConfirmModalOpen(false);
      setSelectedTeacher(null);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการลบข้อมูล" });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (num: number) => {
    setItemsPerPage(num);
    setCurrentPage(1);
  };

  // Reset currentPage to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartmentFilter]);

  if (loading) {
    return <TeachersSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Users className="w-10 h-10 mr-4 text-white" />
              จัดการรายชื่อครู
            </h1>
            <p className="text-white text-lg">แสดงรายชื่อครูทั้งหมด</p>
          </div>
          <Button
            onClick={handleAddTeacherClick}
            className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มรายชื่อครู
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อครู..."
            className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <Select
          onValueChange={setSelectedDepartmentFilter}
          value={selectedDepartmentFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="กรองตามแผนก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกแผนก</SelectItem>
            {allDepartments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TeacherTable teachers={paginatedTeachers} onEdit={handleEditTeacher} onDelete={handleDeleteClick} />

      <TeachersPagination
        totalTeachers={totalFilteredTeachers}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <TeacherFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveTeacher}
        currentTeacher={selectedTeacher || undefined}
      />

      <TeacherDeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        teacherToDelete={selectedTeacher}
      />
    </div>
  );
};

export default Teachers;

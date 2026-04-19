import React, { useState, useEffect } from "react";
import { PlusCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import type { Department } from "@/types/department";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/utils/api/departments";
import DepartmentTable from "@/components/departments/DepartmentTable";
import DepartmentFormModal from "@/components/departments/DepartmentFormModal";
import DepartmentDeleteConfirmModal from "@/components/departments/DepartmentDeleteConfirmModal";
import DepartmentsSkeleton from "../../components/dashboard/skeletons/DepartmentsSkeleton";

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { bulkDeleteDepartments } from "@/utils/api/departments";
import Swal from "sweetalert2";

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 14;

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments(currentPage, itemsPerPage);
      setDepartments(response.data);
      setTotalPages(response.meta_data.totalPages);
      setSelectedIds([]); // Clear selection when page changes
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments.");
      showToastError({ title: "Error", text: "Failed to load departments." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage]);

  const handleAddDepartmentClick = () => {
    setSelectedDepartment(null);
    setIsFormModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSelectChange = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleSelectAllChange = (selected: boolean) => {
    setSelectedIds(selected ? departments.map(d => d.id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "ยืนยันการลบหลายรายการ",
      text: `คุณแน่ใจหรือไม่ว่าต้องการลบ ${selectedIds.length} แผนกที่เลือก? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบที่เลือก!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await bulkDeleteDepartments(selectedIds);
        showToastSuccess({ title: "Success", text: `ลบ ${selectedIds.length} แผนกสำเร็จ!` });
        fetchDepartments();
      } catch (err) {
        console.error("Error bulk deleting departments:", err);
        showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการลบหลายรายการ" });
      }
    }
  };

  const handleSaveDepartment = async (departmentData: Omit<Department, 'id'> | Department) => {
    try {
      if (selectedDepartment) {
        await updateDepartment(selectedDepartment.id, departmentData);
        showToastSuccess({ title: "Success", text: "อัพเดทแผนกสำเร็จ!" });
      } else {
        await createDepartment(departmentData as Omit<Department, 'id'>);
        showToastSuccess({ title: "Success", text: "อัพเดทแผนก!" });
      }
      fetchDepartments();
      setIsFormModalOpen(false);
      return true;
    } catch (err) {
      console.error("Error saving department:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการบันทึก" });
      return false;
    }
  };

  const handleDeleteConfirm = async (departmentId: string) => {
    try {
      await deleteDepartment(departmentId);
      showToastSuccess({ title: "Success", text: "ลบแผนกสำเร็จ!" });
      fetchDepartments();
      setIsDeleteConfirmModalOpen(false);
      setSelectedDepartment(null);
    } catch (err) {
      console.error("Error deleting department:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการลบแผนก" });
    }
  };

  if (loading) {
    return <DepartmentsSkeleton />;
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
              <Building className="w-10 h-10 mr-4 text-white" />
              จัดการแผนก
            </h1>
            <p className="text-white text-lg">รายการแผนกทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="flex items-center bg-red-500 hover:bg-red-600 transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                ลบที่เลือก ({selectedIds.length})
              </Button>
            )}
            <Button
              onClick={handleAddDepartmentClick}
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              เพิ่มแผนกใหม่
            </Button>
          </div>
        </div>
      </div>
      <DepartmentTable 
        departments={departments} 
        onEdit={handleEditDepartment} 
        onDelete={handleDeleteClick}
        selectedIds={selectedIds}
        onSelectChange={handleSelectChange}
        onSelectAllChange={handleSelectAllChange}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ถัดไป
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      <DepartmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveDepartment}
        currentDepartment={selectedDepartment || undefined}
      />

      <DepartmentDeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        departmentToDelete={selectedDepartment}
      />
    </div>
  );
};

export default Departments;

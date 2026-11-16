import React, { useState, useEffect, useMemo } from "react";
import useUsersData from "../../hooks/useUsersData";
import UsersTable from "../../components/users/UsersTable";
import UsersTableSkeleton from "../../components/users/skeletons/UsersTableSkeleton";
import UserFormModal from "../../components/users/UserFormModal";
import UserDeleteConfirmModal from "../../components/users/UserDeleteConfirmModal";
import { UserCog, PlusCircle, Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "../../types";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import UsersPagination from "@/components/users/UsersPagination";

const Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [filterType, setFilterType] = useState<
    "all" | "teachers" | "regular" | "staff"
  >("all");

  const { users, loading, error, addUser, editUser, removeUser } =
    useUsersData();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, debouncedSearchTerm]);

  // คำนวณจำนวนผู้ใช้งานแต่ละประเภทจากข้อมูลทั้งหมดในระบบ
  const counts = useMemo(() => {
    return {
      all: users.length,
      teachers: users.filter((u) => Boolean(u.teacher_id || u.teacher)).length,
      regular: users.filter(
        (u) => !u.teacher_id && !u.teacher && u.role === "USER"
      ).length,
      staff: users.filter((u) => u.role !== "USER").length,
    };
  }, [users]);

  // กรองผู้ใช้งานตาม filterType และ searchTerm
  const filteredUsers = useMemo(() => {
    let result = users;

    if (filterType === "teachers") {
      result = result.filter((u) => Boolean(u.teacher_id || u.teacher));
    } else if (filterType === "regular") {
      result = result.filter(
        (u) => !u.teacher_id && !u.teacher && u.role === "USER"
      );
    } else if (filterType === "staff") {
      result = result.filter((u) => u.role !== "USER");
    }

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase().trim();
      result = result.filter((u) => {
        const username = u.username?.toLowerCase() || "";
        const firstname = u.firstname?.toLowerCase() || "";
        const lastname = u.lastname?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        const teacherName = u.teacher?.name?.toLowerCase() || "";
        const deptName = u.teacher?.department?.name?.toLowerCase() || "";

        return (
          username.includes(term) ||
          firstname.includes(term) ||
          lastname.includes(term) ||
          email.includes(term) ||
          teacherName.includes(term) ||
          deptName.includes(term)
        );
      });
    }

    return result;
  }, [users, filterType, debouncedSearchTerm]);

  // ข้อมูลที่แสดงในหน้าปัจจุบัน
  const totalFilteredUsers = filteredUsers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser && selectedUser.id) {
        await editUser(selectedUser.id, userData);
      } else {
        await addUser(userData as User);
      }
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      console.error("Failed to save user:", error);
      showToastError({
        title: "เกิดข้อผิดพลาดในการบันทึกผู้ใช้!",
        text:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
      return false;
    }
  };

  const handleDeleteConfirm = async (userId: string) => {
    if (!selectedUser || !selectedUser.id) {
      showToastError({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่พบข้อมูลผู้ใช้งานที่จะลบ.",
      });
      setIsDeleteConfirmModalOpen(false);
      return;
    }
    try {
      await removeUser(userId);
      setIsDeleteConfirmModalOpen(false);
      setSelectedUser(null);
      showToastSuccess({ title: "ลบผู้ใช้งานสำเร็จ!" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToastError({
        title: "เกิดข้อผิดพลาดในการลบผู้ใช้!",
        text:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  // ตรวจสอบ username ซ้ำจากผู้ใช้ทั้งหมดในระบบ
  const handleCheckUsernameAvailability = async (
    username: string,
    currentUserId?: string
  ): Promise<boolean> => {
    try {
      const existingUser = users.find(
        (user) =>
          user.username.toLowerCase() === username.toLowerCase() &&
          user.id !== currentUserId
      );

      const isAvailable = !existingUser;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return isAvailable;
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw new Error("ไม่สามารถตรวจสอบชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <UserCog className="w-10 h-10 mr-4 text-white" />
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-white text-base opacity-90">
              จัดการบัญชีผู้ใช้งานระบบ ทั้งผู้ใช้งานทั่วไปและครูประจำชั้นสำหรับกรอกข้อมูลเค้ก
            </p>
          </div>
          <Button
            onClick={handleAddUserClick}
            className="bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:bg-white dark:text-purple-700 dark:hover:bg-purple-50 dark:hover:text-purple-800 transition-colors duration-200 flex items-center font-semibold shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterType === "all"
                  ? "bg-white text-purple-700 font-semibold shadow-xs"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              ทั้งหมด ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("teachers")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === "teachers"
                  ? "bg-amber-400 text-amber-950 font-bold shadow-xs"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              ครูที่ต้องกรอกข้อมูลเค้ก ({counts.teachers})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("regular")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterType === "regular"
                  ? "bg-white text-purple-700 font-semibold shadow-xs"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              ผู้ใช้งานทั่วไป ({counts.regular})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("staff")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterType === "staff"
                  ? "bg-white text-purple-700 font-semibold shadow-xs"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              เจ้าหน้าที่ / ผู้บริหาร ({counts.staff})
            </button>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้งาน..."
              className="pl-10 bg-white/95 dark:bg-slate-900/90 text-gray-900 dark:text-slate-100 placeholder:text-muted-foreground border border-transparent dark:border-slate-800 rounded-md w-full py-2 sm:w-64 focus:ring-2 focus:ring-white text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <UsersTableSkeleton />
      ) : error ? (
        <div className="p-4 text-red-500 text-center bg-card border border-border rounded shadow-sm">
          Error: {error}
        </div>
      ) : (
        <UsersTable
          users={paginatedUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteClick}
        />
      )}

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        currentUser={selectedUser || undefined}
        onCheckUsernameAvailability={handleCheckUsernameAvailability}
      />

      <UserDeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userToDelete={selectedUser}
      />

      {!loading && !error && (
        <UsersPagination
          totalUsers={totalFilteredUsers}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default Users;

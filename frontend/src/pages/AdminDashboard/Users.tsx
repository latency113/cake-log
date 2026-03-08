import React, { useState, useEffect } from "react";
import useUsersData from "../../hooks/useUsersData";
import UsersTable from "../../components/users/UsersTable";
import UsersTableSkeleton from "../../components/users/skeletons/UsersTableSkeleton";
import UserFormModal from "../../components/users/UserFormModal";
import UserDeleteConfirmModal from "../../components/users/UserDeleteConfirmModal";
import { UserCog, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "../../types";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import UsersPagination from "@/components/users/UsersPagination";
// import InputField from "@/components/common/InputField"; // No longer needed

const Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(""); // Add searchTerm state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const { users, totalCount, loading, error, addUser, editUser, removeUser } =
    useUsersData(currentPage, itemsPerPage, debouncedSearchTerm);

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
        // Editing existing user
        await editUser(selectedUser.id, userData);
      } else {
        // Adding new user
        await addUser(userData as User); // Cast to user
      }
      setIsFormModalOpen(false);
      return true; // Indicate success
    } catch (error) {
      console.error("Failed to save user:", error);
      showToastError({
        title: "เกิดข้อผิดพลาดในการบันทึกผู้ใช้!",
        text:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
      return false; // Indicate failure
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

  // Function สำหรับตรวจสอบ username ซ้ำ
  const handleCheckUsernameAvailability = async (
    username: string,
    currentUserId?: string
  ): Promise<boolean> => {
    try {
      console.log(
        "Checking username availability:",
        username,
        "for user ID:",
        currentUserId
      );

      // ตรวจสอบใน users array ที่มีอยู่
      const existingUser = users.find(
        (user) =>
          user.username.toLowerCase() === username.toLowerCase() &&
          user.id !== currentUserId // ไม่นับ user ปัจจุบัน (กรณี edit)
      );

      const isAvailable = !existingUser;
      console.log("Username availability result:", isAvailable);

      // จำลองการเรียก API (ถ้าต้องการ)
      // ในการใช้งานจริง อาจจะเรียก API แทน
      // const response = await fetch('/api/check-username', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, currentUserId })
      // });
      // const result = await response.json();
      // return result.isAvailable;

      // เพิ่ม delay เล็กน้อยเพื่อจำลอง API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      return isAvailable;
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw new Error("ไม่สามารถตรวจสอบชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log("Users.tsx - Page changed to:", page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page changes
    console.log("Users.tsx - Items per page changed to:", items);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-purple-400 to-violet-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-4">
          {" "}
          {/* Added mb-4 for spacing */}
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <UserCog className="w-10 h-10 mr-4 text-white" />
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-white text-lg">รายการแสดงชื่อผู้ใช้งานทั้งหมด</p>
          </div>
          <Button
            onClick={handleAddUserClick}
            className="bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>
        <div className="flex justify-between items-center">
          {/* Modified this section for search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้งาน..."
              className="pl-10 bg-white/90 text-gray-900 border-none rounded-md w-full py-2 sm:w-64 focus:ring-2 focus:ring-white"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <UsersTableSkeleton />
      ) : error ? (
        <div className="p-4 text-red-500 text-center bg-white rounded shadow-sm">
          Error: {error}
        </div>
      ) : (
        <UsersTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteClick}
        />
      )}

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        currentUser={selectedUser || undefined}
        onCheckUsernameAvailability={handleCheckUsernameAvailability} // เพิ่ม prop นี้
      />

      <UserDeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userToDelete={selectedUser}
      />

      {!loading && !error && (
        <UsersPagination
          totalUsers={totalCount}
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

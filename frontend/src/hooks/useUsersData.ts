import { useState, useEffect, useCallback } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../utils/api/users";
import type { User } from "../types";

const useUsersData = (currentPage: number, itemsPerPage: number, searchTerm: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers(currentPage, itemsPerPage, searchTerm);
      setUsers(response.data);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(async (newUser: User) => {
    setLoading(true);
    try {
      await createUser(newUser);
      // After adding, re-fetch users for the current page to reflect changes
      await fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create user.");
      throw err; // Re-throw the error
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, currentPage, itemsPerPage, searchTerm]);

  const editUser = useCallback(async (id: string, updatedUser: Partial<User>) => {
    setLoading(true);
    try {
      await updateUser(id, updatedUser);
      // After editing, re-fetch users for the current page to reflect changes
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setError("ไม่สามารถอัปเดตผู้ใช้ได้");
      throw err; // Re-throw the error
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, currentPage, itemsPerPage, searchTerm]);

  const removeUser = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteUser(id);
      // After deleting, re-fetch users for the current page to reflect changes
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
      throw err; // Re-throw the error
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, currentPage, itemsPerPage, searchTerm]);

  return {
    users,
    totalCount,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    fetchUsers
  };
};

export default useUsersData;
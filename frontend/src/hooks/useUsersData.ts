import { useState, useEffect, useCallback } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../utils/api/users";
import type { User } from "../types";

const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all users to support client-side filtering, searching, and accurate tab counts
      const response = await getUsers(1, 10000);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(
    async (newUser: User) => {
      setLoading(true);
      try {
        await createUser(newUser);
        await fetchUsers();
      } catch (err) {
        console.error("Error creating user:", err);
        setError("Failed to create user.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  const editUser = useCallback(
    async (id: string, updatedUser: Partial<User>) => {
      setLoading(true);
      try {
        await updateUser(id, updatedUser);
        await fetchUsers();
      } catch (err) {
        console.error("Error updating user:", err);
        setError("ไม่สามารถอัปเดตผู้ใช้ได้");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  const removeUser = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  return {
    users,
    totalCount: users.length,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    fetchUsers,
  };
};

export default useUsersData;

import { useState, useEffect } from "react";
import { getAllUsers } from "../utils/api/data";
import type { User } from "../types";

const useAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const allUsers = await getAllUsers(100);
        setUsers(allUsers);
      } catch (err) {
        console.error("Error fetching all users:", err);
        setError("Failed to load all user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

export default useAllUsers;

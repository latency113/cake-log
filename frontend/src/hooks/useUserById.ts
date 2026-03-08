import { useState, useEffect } from "react";
import { getUserById } from "../utils/api/users";
import type { User } from "../types";

const useUserById = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error(`Error fetching user with ID ${userId}:`, err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};

export default useUserById;

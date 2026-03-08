import { api } from "../api";
import type { User } from "@/types/user";

export const getUsers = async (page: number, limit: number, searchTerm?: string) => {
  try {
    const response = await api.get(`/users?page=${page}&itemsPerPage=${limit}&${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`);
    return {
      data: response.data.data,
      totalCount: response.data.meta_data.total,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

export const createUser = async (newUser: User) => {
  try {
    const response = await api.post(`/users/`, newUser);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id: string, updatedUser: Partial<User>) => {
  try {
    const response = await api.patch(`/users/${id}`, updatedUser);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

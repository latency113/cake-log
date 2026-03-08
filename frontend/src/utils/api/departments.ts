import { api } from "../api";
import type { Department } from "../../types/department";

export const getDepartments = async (page: number = 1, itemsPerPage: number = 9999): Promise<{ data: Department[]; meta_data: any }> => {
  try {
    const response = await api.get("/departments", {
      params: { page, itemsPerPage },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const createDepartment = async (departmentData: Omit<Department, 'id'>): Promise<Department> => {
  try {
    const response = await api.post("/departments", departmentData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const updateDepartment = async (id: string, departmentData: Partial<Department>): Promise<Department> => {
  try {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating department ${id}:`, error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/departments/${id}`);
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
    throw error;
  }
};

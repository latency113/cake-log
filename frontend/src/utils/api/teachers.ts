import { api } from "../api";
import type { Teacher } from "../../types/teacher";

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await api.get("/teachers", {
      params: { itemsPerPage: 9999 }, // Fetch all teachers
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

export const createTeacher = async (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
  try {
    const response = await api.post("/teachers", teacherData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
};

export const updateTeacher = async (id: string, teacherData: Partial<Teacher>): Promise<Teacher> => {
  try {
    const response = await api.patch(`/teachers/${id}`, teacherData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating teacher ${id}:`, error);
    throw error;
  }
};

export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    await api.delete(`/teachers/${id}`);
  } catch (error) {
    console.error(`Error deleting teacher ${id}:`, error);
    throw error;
  }
};

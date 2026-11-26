import { api } from "../api";
import type { DashboardSummary, User } from "../../types";
import type { Classroom } from "../../types/classroom";
import type { ClassroomCakeSummary } from "../../types/classroomCakeSummary";
import type { GradeLevel } from "../../types/gradelevel";
import { getCachedOrFetch, invalidateApiCache } from "../apiCache";

export const getClassrooms = async (page: number, itemsPerPage: number): Promise<Classroom[]> => {
  try {
    return await getCachedOrFetch(`classrooms:${page}:${itemsPerPage}`, async () => {
      const response = await api.get(`/classrooms`, {
        params: { page, itemsPerPage },
      });
      return response.data.data;
    });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
};

export const finalizeClassroom = async (classroomId: string) => {
  try {
    const response = await api.patch(`/classrooms/${classroomId}/finalize`);
    invalidateApiCache("classrooms:");
    return response.data;
  } catch (error) {
    console.error("Error finalizing classroom:", error);
    throw error;
  }
};

export const unfinalizeClassroom = async (classroomId: string) => {
  try {
    const response = await api.patch(`/classrooms/${classroomId}/unfinalize`);
    invalidateApiCache("classrooms:");
    return response.data;
  } catch (error) {
    console.error("Error unfinalizing classroom:", error);
    throw error;
  }
};

export const getYears = async (): Promise<GradeLevel[]> => {
  try {
    return await getCachedOrFetch("grade-levels:all", async () => {
      const response = await api.get("/grade-levels");
      return response.data.data;
    });
  } catch (error) {
    console.error("Error fetching years:", error);
    throw error;
  }
};


export const getAllUsers = async (itemsPerPage?: number): Promise<User[]> => {
  try {
    const params: { itemsPerPage?: number } = {};
    if (itemsPerPage !== undefined) {
      params.itemsPerPage = itemsPerPage;
    }
    const response = await api.get(`/users`, { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getClassroomCakeSummaries = async (filterUserId?: string): Promise<ClassroomCakeSummary[]> => {
  try {
    const response = await api.get("/orders/summary/classrooms", {
      params: filterUserId ? { userId: filterUserId } : undefined,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching classroom cake summaries:", error);
    throw error;
  }
};

export const getSalesData = async (): Promise<DashboardSummary> => {
  try {
    const response = await api.get("/orders/summary/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error in getSalesData:", error);
    throw error;
  }
};

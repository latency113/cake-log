import { api } from "../api"; // Assuming 'api' is already set up for general API calls
import type { ICakeSettings } from "../../types/cake";

export const restoreDataFromBackup = async (fileName?: string, key?: string): Promise<{ message: string; data: string }> => {
  try {
    const response = await api.post("/admin/restore-backup", { fileName, key });
    return response.data;
  } catch (error) {
    console.error("Error during data restore:", error);
    throw error;
  }
};

export const downloadBackup = async (fileName: string, key: string): Promise<Blob> => {
  try {
    const response = await api.post("/admin/download-backup", { fileName, key }, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading backup:", error);
    throw error;
  }
};

export const clearData = async (): Promise<{ message: string }> => {
  try {
    const response = await api.post("/admin/clear-data");
    return response.data;
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
};

export const restorePrePromotionBackup = async (key?: string): Promise<{ message: string; data: string }> => {
  try {
    const response = await api.post("/admin/restore-pre-promotion-backup", { key });
    return response.data;
  } catch (error) {
    console.error("Error during pre-promotion data restore:", error);
    throw error;
  }
};

export const backupData = async (tag?: string): Promise<{ message: string; data: string }> => {
  try {
    const response = await api.post("/admin/backup", { tag });
    return response.data;
  } catch (error) {
    console.error("Error during data backup:", error);
    throw error;
  }
};

export const getBackups = async (): Promise<{ backups: string[] }> => {
  try {
    const response = await api.get("/admin/backups");
    return response.data;
  } catch (error) {
    console.error("Error fetching backups:", error);
    throw error;
  }
};

export const createCakeSettings = async (settingsData: any): Promise<{ message: string; data: any }> => {
  try {
    const response = await api.post("/admin/cake-settings", settingsData);
    return response.data;
  } catch (error) {
    console.error("Error creating cake settings:", error);
    throw error;
  }
};

export const initYearDatabase = async (year: string): Promise<{ message: string; data: any }> => {
  try {
    const response = await api.post("/admin/init-year", { year });
    return response.data;
  } catch (error) {
    console.error("Error initializing year database:", error);
    throw error;
  }
};

export const deleteYearDatabase = async (year: string): Promise<{ message: string; data: any }> => {
  try {
    const response = await api.delete(`/admin/year/${year}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting year database:", error);
    throw error;
  }
};

export const getSystemActiveYear = async (): Promise<{ academicYear: string }> => {
  try {
    const response = await api.get("/admin/system-active-year");
    return response.data;
  } catch (error) {
    console.error("Error fetching system active year:", error);
    return { academicYear: "2569" };
  }
};

export const getAvailableYears = async (): Promise<string[]> => {
  try {
    const response = await api.get("/admin/available-years");
    return response.data.years;
  } catch (error) {
    console.error("Error fetching available years:", error);
    return ["2569"]; // Fallback default
  }
};

export const getCakeSettings = async (): Promise<ICakeSettings | null> => {
  try {
    const response = await api.get("/admin/cake-settings", {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      params: {
        _t: Date.now(), // Cache-busting timestamp
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cake settings:", error);
    throw error;
  }
};
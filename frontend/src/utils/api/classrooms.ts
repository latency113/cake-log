import { api } from "../api";
import type { Classroom } from "../../types/classroom";

export const getClassrooms = async (page: number, itemsPerPage: number, departmentId?: string): Promise<{ data: Classroom[]; meta_data: any }> => {
  try {
    const params: { page: number; itemsPerPage: number; department_id?: string } = {
      page,
      itemsPerPage,
    };

    if (departmentId && departmentId !== "all") {
      params.department_id = departmentId;
    }

    const response = await api.get("/classrooms", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
};

export const createClassroom = async (classroomData: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'> & { file?: File | null }): Promise<Classroom> => {
  try {
    const { file, ...rest } = classroomData;
    const formData = new FormData();

    for (const key in rest) {
      if (Object.prototype.hasOwnProperty.call(rest, key)) {
        const value = (rest as any)[key];
        if (key === "students") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    }

    if (file) {
      formData.append("file", file);
    }

    const response = await api.post("/classrooms", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw error;
  }
};

export const updateClassroom = async (id: string, classroomData: Partial<Classroom> & { file?: File | null }): Promise<Classroom> => {
  try {
    const { file, students, ...rest } = classroomData;

    let response;

    if (file) {
      const formData = new FormData();
      for (const key in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, key)) {
          formData.append(key, (rest as any)[key]);
        }
      }
      if (students) {
        formData.append("students", JSON.stringify(students));
      }
      formData.append("file", file);

      response = await api.patch(`/classrooms/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
          } else {
            // If no file, send as JSON
            const payload: Partial<Classroom> = { ...rest };
            if (students) {
              (payload as any).students = JSON.stringify(students); // Stringify students even if no file
            }
    
            response = await api.patch(`/classrooms/${id}`, payload);
          }
    // If response.data is empty or null, it might be a 204 No Content.
    // In such cases, we assume success and return the passed classroomData or a placeholder.
    if (!response.data) {
      console.warn(`API responded with no data for classroom update (ID: ${id}). Assuming success.`);
      return { id, ...classroomData } as Classroom;
    }
    return response.data.data;
  } catch (error) {
    console.error(`Error updating classroom ${id}:`, error);
    throw error;
  }
};

export const deleteClassroom = async (id: string): Promise<void> => {
  try {
    await api.delete(`/classrooms/${id}`);
  } catch (error) {
    console.error(`Error deleting classroom ${id}:`, error);
    throw error;
  }
};

export const getStudentsCakePounds = async (classroomId: string): Promise<{ students: { number: string; name: string; totalPounds: number; }[]; totalPoundsForClassroom: number; }> => {
  try {
    const response = await api.get(`/classrooms/${classroomId}/students-with-cake-pounds`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const promoteClassrooms = async (): Promise<{ message: string }> => {
  try {
    const response = await api.post("/classrooms/promote");
    return response.data;
  } catch (error) {
    console.error("Error promoting classrooms:", error);
    throw error;
  }
};

export const importClassroomsFromExcel = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/classrooms/import", formData, {
      headers: {
        "Content-Type": "multipart/form-0data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error importing classrooms:", error);
    throw error;
  }
};
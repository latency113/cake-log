import { api } from "../api";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    role: string;
    firstname: string;
    lastname: string;
    email?: string;
  };
}

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const me = async (): Promise<LoginResponse['user'] & { access_token?: string }> => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export interface AuthClassroom {
  id: string;
  name: string;
  teacher_id: string;
  department_id: string;
  grade_level_id: string;
  department?: {
    id: string;
    name: string;
  };
  grade_level?: {
    id: string;
    level: "VOCATIONAL" | "HIGHER";
    year: number;
  };
  teacher?: {
    id: string;
    name: string;
  };
}

export interface RegisterDto {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email?: string;
  classroom_id: string;
}

export const getAuthClassrooms = async (): Promise<AuthClassroom[]> => {
  try {
    const response = await api.get("/auth/classrooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching classrooms for auth:", error);
    throw error;
  }
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const response = await api.get(`/auth/check-username/${encodeURIComponent(username)}`);
    return response.data?.available ?? false;
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
};

export const registerUser = async (data: RegisterDto): Promise<{ message: string; user: any }> => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    console.error("Error during registration:", error);
    const message = error.response?.data?.message || error.response?.data || "การลงทะเบียนไม่สำเร็จ";
    throw new Error(typeof message === "string" ? message : "การลงทะเบียนไม่สำเร็จ");
  }
};




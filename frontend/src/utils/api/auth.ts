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



import type { CakeRequest } from "@/types/request";
import { api }  from "../api";

export const getRequests = async () => {
  try {
    const response = await api.get(`/cake-requests/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cake-requests:", error);
    throw error;
  }
};

export const getRequestsByDate = async (date: string) => {
  try {
    const response = await api.get(`/cake-requests?requestDate=${date}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cake-requests for date ${date}:`, error);
    throw error;
  }
};

export const createRequest = async (newRequest:Request) => {
  try {
    const response = await api.post(`/cake-requests/`, newRequest);
    return response.data;
  } catch (error) {
    console.error("Error create cake-request:", error);
    throw error;
  }
};

export const createRequestItem = async (newRequestItem:CakeRequest) => {
  try {
    const response = await api.post(`/cake-request-items/`, newRequestItem);
    return response.data;
  } catch (error) {
    console.error("Error create cake-request-item:", error);
    throw error;
  }
};

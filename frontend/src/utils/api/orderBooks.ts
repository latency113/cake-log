import { api } from "../api";
import type { CreateOrderBookDto, UpdateOrderBookDto } from "@/types/orderBook";

export const getOrderBooks = async (page = 1, itemsPerPage = 10, search = "") => {
  const response = await api.get("/order-books", {
    params: { page, itemsPerPage, search },
  });
  return response.data;
};

export const getOrderBook = async (id: string) => {
  const response = await api.get(`/order-books/${id}`);
  return response.data;
};

export const getAvailableOrderBook = async () => {
  const response = await api.get("/order-books/available");
  return response.data;
};

export const createOrderBook = async (data: CreateOrderBookDto) => {
  const response = await api.post("/order-books", data);
  return response.data;
};

export const updateOrderBook = async (id: string, data: UpdateOrderBookDto) => {
  const response = await api.patch(`/order-books/${id}`, data);
  return response.data;
};

export const assignOrderBook = async (id: string, owner_id: string) => {
  const response = await api.patch(`/order-books/${id}/assign`, { owner_id });
  return response.data;
};

export const deleteOrderBook = async (id: string) => {
  const response = await api.delete(`/order-books/${id}`);
  return response.data;
};

export const bulkCloseOrderBooks = async (options: {
  ids?: string[];
  closeAllUnbooked?: boolean;
}) => {
  const response = await api.post("/order-books/bulk-close", options);
  return response.data;
};

export const bulkOpenOrderBooks = async (options: {
  ids?: string[];
  openAllUnbooked?: boolean;
}) => {
  const response = await api.post("/order-books/bulk-open", options);
  return response.data;
};



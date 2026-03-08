import { api } from "../api";
import type { Product } from "../../types";
import axios from "axios";

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/products");
    if (!response.data) {
      return [];
    }
    
    const products = response.data.data || response.data;    
    if (!Array.isArray(products)) {
      return [];
    }
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    if (axios.isAxiosError(error)) {
      console.error('Detailed error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await api.post("/products", productData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

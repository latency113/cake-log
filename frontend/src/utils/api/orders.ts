import { api } from "../api";
import type { Order } from "../../types/order";
import type { OrderItem } from "../../types/orderItem"
import { getProducts } from "./products";
import { departments } from "../../data/department-data"; // Import departments


export const createOrder = async (orderData: Order) => {
  try {
    const parsedData = {
      ...orderData,
      // book_number: Number(orderData.book_number),
      // number: Number(orderData.number),
    };
    const response = await api.post("/orders", parsedData);
    const result = response.data.data ? response.data.data : response.data;
    // Assuming the actual order object is nested under 'newOrder'
    const newOrder = result.newOrder || result;
    return { ...newOrder, id: newOrder.id || '' };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrderById = async (id: string) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const createOrderItems = async (orderItem: OrderItem) => {
  try {
    const response = await api.post('/order-items', orderItem);
    return response.data;
  } catch (error) {
    console.error("Error creating order items:", error);
    throw error;
  }
};

export const getAllOrders = async (page: number , itemsPerPage: number, userRole?: string): Promise<Order[]> => {
  try {
    const products = await getProducts();
    const productMap = new Map<string, string>();
    products.forEach(product => {
      productMap.set(product.id!, product.name);
    });

    const params: any = { page, itemsPerPage, _expand: "department,order_items,user" };
    if (userRole === 'SUPERADMIN') {
      params.showAll = true; // Add query parameter to signal backend to show all orders
    }

    const response = await api.get(`/orders`,{ params });
    const response_data = response.data ?? {}; // Ensure response_data is an object

    // Ensure response_data.data is an array before mapping
    const allOrders: Order[] = (Array.isArray(response_data) ? response_data : response_data.data || []).map((order: any) => { // Use 'any' temporarily for flexible property access
      const enrichedOrderItems = (order.order_items ?? []).map((item: any) => ({
        ...item,
        productName: productMap.get(item.product_id) || "Unknown Product"
      }));

      // Enrich departmentName
      let departmentName = order.departmentName; // Use existing departmentName if available
      let departmentIdentifier = order.department_id || order.effectiveDepartmentId; // Use effectiveDepartmentId if department_id is undefined

      if (!departmentName && departmentIdentifier) {
        // First, try to find department name by direct match (assuming identifier might be the name)
        if (departments.includes(departmentIdentifier)) {
          departmentName = departmentIdentifier;
        } else {
          // If not a direct match, try to find by index
          const departmentIndex = parseInt(departmentIdentifier, 10);
          if (!isNaN(departmentIndex) && departments[departmentIndex]) {
            departmentName = departments[departmentIndex];
          }
        }
      }

      return { ...order, orderItems: enrichedOrderItems, departmentName: departmentName || 'N/A' };
    });
    return allOrders;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const getOrdersByClassroom = async (classroomId: string): Promise<Order[]> => {
  try {
    const products = await getProducts();
    const productMap = new Map<string, string>();
    products.forEach(product => {
      productMap.set(product.id!, product.name);
    });

    const response = await api.get(`/orders`, {
      params: { 
        classroom_id: classroomId, 
        _expand: "department,order_items,user",
        itemsPerPage: 1000 // ดึงข้อมูลมาทั้งหมดเพื่อป้องกันปัญหา Pagination
      }
    });
    
    const response_data = response.data ?? {};
    const orders: Order[] = (Array.isArray(response_data) ? response_data : response_data.data || []).map((order: any) => {
      const enrichedOrderItems = (order.order_items ?? []).map((item: any) => ({
        ...item,
        productName: productMap.get(item.product_id) || "Unknown Product"
      }));

      return { ...order, orderItems: enrichedOrderItems };
    });
    return orders;
  } catch (error) {
    console.error(`Error fetching orders for classroom ${classroomId}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, newStatus: string, officerPrepareId?: string, officerPickupId?: string, pickedUpAt?: string) => {
  try {
    const payload: { status: string; officer_prepare_id?: string; officer_pickup_id?: string; picked_up_at?: string } = { status: newStatus };
    if (officerPrepareId) {
      payload.officer_prepare_id = officerPrepareId;
    }
    if (officerPickupId) {
      payload.officer_pickup_id = officerPickupId;
    }
    if (pickedUpAt) {
      payload.picked_up_at = pickedUpAt;
    }
    const response = await api.patch(`/orders/${orderId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw error;
  }
};

export const updateOrder = async (id: string, orderData: Order) => {
  try {
    const parsedData = {
      ...orderData,
    };
    const response = await api.patch(`/orders/${id}`, parsedData);
    const result = response.data.data ? response.data.data : response.data;
    // Assuming the actual order object is nested under 'newOrder'
    const updatedOrder = result.newOrder || result;
    return { ...updatedOrder, id: updatedOrder.id || id }; // Use the provided 'id' if response doesn't have one
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

export const updateOrderItem = async (orderItemId: string, orderItemData: OrderItem) => {
  try {
    const response = await api.put(`/order-items/${orderItemId}`, orderItemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order item ${orderItemId}:`, error);
    throw error;
  }
};

export const deleteOrderItem = async (orderItemId: string) => {
  try {
    const response = await api.delete(`/order-items/${orderItemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order item ${orderItemId}:`, error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};

export const deleteAllOrders = async () => {
  try {
    const response = await api.delete("/orders/all");
    return response.data;
  } catch (error) {
    console.error("Error deleting all orders:", error);
    throw error;
  }
};

export const checkOrderExists = async (
  number: string,
  orderId?: string
) => {
  try {
    const response = await api.get("/orders", {
      params: {
        number,
      },
    });

    let orders = response.data.data || response.data;
    if (!Array.isArray(orders)) {
      orders = [];
    }

    // Manually filter by number, as the API might not be doing it
    let conflictingOrders = orders.filter((order: Order) => order.number.toString() === number);

    if (orderId) {
      conflictingOrders = conflictingOrders.filter(
        (order: Order) => order.id !== orderId
      );
    }

    return conflictingOrders.length > 0;
  } catch (error) {
    console.error("Error checking if order exists:", error);
    throw error;
  }
};



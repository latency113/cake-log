import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllOrders } from "../utils/api/orders";
import { getClassrooms } from "../utils/api/data";
import type { Order, Department, Classroom } from "../types";
import { getDepartments } from "@/utils/api/departments";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

interface UseOrdersDataResult {
  orders: Order[];
  ordersByDate: Map<string, Order[]>;
  loading: boolean;
  classroomToDepartmentMap: Map<string, string>;
  departmentMap: Map<string, string>;
  revalidate: () => void;
}

const useOrdersData = (): UseOrdersDataResult => {
  const { user: currentUser } = useAuth(); // Get current user
  const [orders, setOrders] = useState<Order[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, departmentsData, classroomsData] = await Promise.all([
        getAllOrders(1, 5000, currentUser?.role), // Pass currentUser.role
        getDepartments(),
        getClassrooms(1, 999),
      ]);

      setOrders(ordersData);
      setDepartments(departmentsData.data);
      setClassrooms(classroomsData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const classroomToDepartmentMap = useMemo(() => {
    const map = new Map<string, string>();
    classrooms.forEach((classroom) => {
      map.set(classroom.id, classroom.department_id);
    });
    return map;
  }, [classrooms]);

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((department) => {
      map.set(department.id, department.name);
    });
    return map;
  }, [departments]);

  const enrichedOrders = useMemo(() => {
    return orders.map((order) => {
      const departmentId = classroomToDepartmentMap.get(order.classroom_id ?? "");
      const departmentName = departmentId ? departmentMap.get(departmentId) : "N/A";
      return { ...order, departmentName };
    });
  }, [orders, classroomToDepartmentMap, departmentMap]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, Order[]>();
    enrichedOrders.forEach((order) => {
      const pickupDateValue = order.pickup_date;
      let tempFormattedDate: string; // Declare as string

      if (pickupDateValue !== undefined && pickupDateValue !== null) {
        const dateObj = new Date(pickupDateValue);
        if (!isNaN(dateObj.getTime())) {
          tempFormattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
        } else {
          tempFormattedDate = ''; // Assign empty string for invalid dates
        }
      } else {
        tempFormattedDate = ''; // Assign empty string for undefined/null pickupDateValue
      }

      // Create a new variable explicitly typed as string
      const mapKey: string = tempFormattedDate;

      if (!map.has(mapKey)) {
        map.set(mapKey, []);
      }
      const ordersForDate = map.get(mapKey);
      if (ordersForDate) {
        ordersForDate.push(order);
      }
    });
    return map;
  }, [enrichedOrders]);

  return {
    orders: enrichedOrders,
    ordersByDate,
    loading,
    classroomToDepartmentMap,
    departmentMap,
    revalidate: fetchData,
  };
};

export default useOrdersData;
import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllOrders } from "../utils/api/orders";
import { getClassrooms } from "../utils/api/data";
import type { Order, Department, Classroom } from "../types";
import { getDepartments } from "@/utils/api/departments";
import { OrderStatus, TeamType } from "../types/common";
import { getTeams } from "../utils/api/teams"; // Add this import
import type { TeamWithRelations } from "../types/team"; // Add this import

interface UsePendingOrdersDataResult {
  pendingOrders: Order[];
  loading: boolean;
  revalidate: () => void;
}

const usePendingOrdersData = (): UsePendingOrdersDataResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teams, setTeams] = useState<TeamWithRelations[]>([]); // Add this state
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, departmentsData, classroomsData, teamsData] = // Add teamsData
        await Promise.all([
          getAllOrders(1, 5000), // Fetch all orders
          getDepartments(),
          getClassrooms(1, 999),
          getTeams(1, 5000), // Fetch all teams
        ]);
      setOrders(ordersData);
      setDepartments(departmentsData.data);
      setClassrooms(classroomsData);
      setTeams(teamsData.data); // Set teams data
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

  // New: Create a map for teams
  const teamMap = useMemo(() => {
    const map = new Map<string, { name: string; type: TeamType }>();
    teams.forEach((team) => {
      map.set(team.id, { name: team.name, type: team.team_type });
    });
    return map;
  }, [teams]);

  const pendingOrders = useMemo(() => {
    const enrichedAndFilteredOrders = orders
      .map((order) => {
        const departmentId = classroomToDepartmentMap.get(order.classroom_id ?? "");
        const departmentName = departmentId ? departmentMap.get(departmentId) : "N/A";

        // Enrich with team details
        const teamInfo = order.team_id ? teamMap.get(order.team_id) : undefined;
        const teamName = teamInfo?.name || (order.competitionType === "person" ? order.customerName : "ไม่แข่งขัน"); // Fallback for person or no team
        const teamType = teamInfo?.type || (order.competitionType === "person" ? "person" : undefined); // Set teamType from fetched data or 'person'

        return { ...order, departmentName, teamName, teamType }; // Add teamName and teamType
      })
      .filter((order) => order.status === OrderStatus.PENDING || order.status === OrderStatus.APPROVED || order.status === OrderStatus.COMPLETE)
      .sort((a, b) => {
        const dateA = new Date(a.pickup_date).getTime();
        const dateB = new Date(b.pickup_date).getTime();
        return dateA - dateB;
      });
    return enrichedAndFilteredOrders;
  }, [orders, classroomToDepartmentMap, departmentMap, teamMap]); // Add teamMap to dependencies

  return {
    pendingOrders,
    loading,
    revalidate: fetchData,
  };
};

export default usePendingOrdersData;

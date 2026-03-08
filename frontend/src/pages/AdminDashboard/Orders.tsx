import { deleteAllOrders, deleteOrder } from "../../utils/api/orders"; // updateOrder is not directly used here
import React, { useState, useMemo, useCallback, useEffect } from "react";
import useOrdersData from "../../hooks/useOrdersData";
import OrdersActionBar from "../../components/orders/OrdersActionBar";
import OrdersTable from "../../components/orders/OrdersTable";
import OrdersPagination from "../../components/orders/OrdersPagination";
import OrdersSkeleton from "../../components/orders/skeletons/OrdersSkeleton";
import * as XLSX from "xlsx";
import type { Order, OrderItem, Team } from "../../types"; // User type is not directly used here, only the value of currentUser
import Swal from 'sweetalert2';
import OrderEditModal from "../../components/orders/OrderEditModal"; // Import OrderEditModal
import OrderDeleteConfirmModal from "../../components/orders/OrderDeleteConfirmModal"; // Import OrderDeleteConfirmModal
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook
import { showAlertSuccess, showAlertError } from "../../utils/alerts"; // Import alerts
import { getTeams } from "../../utils/api/teams"; // Import getTeams

const Orders: React.FC = () => {
  const { user: currentUser } = useAuth(); // Get current user
  const {
    orders,
    loading,
    classroomToDepartmentMap,
    departmentMap,
    revalidate,
  } = useOrdersData();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all"); // New state for department filter
  const [statusFilter, setStatusFilter] = useState<string>("all"); // New state for status filter
  const [teamFilter, setTeamFilter] = useState<string>("all"); // New state for team filter
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null);
  const [allTeams, setAllTeams] = useState<Map<string, Team>>(new Map()); // State to store team objects


  // Fetch teams data for enrichment
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const fetchedTeams = await getTeams();
        const teamMap = new Map<string, Team>(); // Changed to Map<string, Team>
        fetchedTeams.data.forEach((team) => {
          teamMap.set(team.id, team); // Store full team object
        });
        setAllTeams(teamMap);
      } catch (error) {
        console.error("Error fetching teams for AdminDashboard:", error);
      }
    };
    fetchTeamsData();
  }, []);

  const filteredOrders = useMemo(() => {
    let tempOrders = orders;

    if (searchTerm) {
      tempOrders = tempOrders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.book?.bookNumber || order.book_id).toString().includes(searchTerm) ||
          order.number.toString().includes(searchTerm)
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterTerm === "today") {
      tempOrders = tempOrders.filter(
        (order) =>
          new Date(order.pickup_date).toDateString() === today.toDateString()
      );
    } else if (filterTerm === "this_week") {
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to the first day of the current week (Sunday)
      tempOrders = tempOrders.filter(
        (order) => new Date(order.pickup_date) >= startOfWeek
      );
    } else if (filterTerm === "this_month") {
      tempOrders = tempOrders.filter(
        (order) =>
          new Date(order.pickup_date).getMonth() === now.getMonth() &&
          new Date(order.pickup_date).getFullYear() === now.getFullYear()
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      tempOrders = tempOrders.filter(
        (order) =>
          classroomToDepartmentMap.get(order.classroom_id ?? "") ===
          departmentFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      tempOrders = tempOrders.filter((order) => order.status === statusFilter);
    }

    // Apply team filter
    if (teamFilter !== "all") {
      tempOrders = tempOrders.filter((order) => order.team_id === teamFilter);
    }

    return tempOrders;
  }, [
    orders,
    searchTerm,
    filterTerm,
    departmentFilter,
    statusFilter,
    teamFilter, // Add teamFilter to dependencies
    classroomToDepartmentMap,
  ]);

  const totalSalesPounds = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const orderPounds = order.order_items.reduce((itemSum, item) => itemSum + (item.pound * item.quantity), 0);
      return sum + orderPounds;
    }, 0);
  }, [filteredOrders]);

  const totalSalesBaht = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex).map((order) => {
      const departmentName =
        departmentMap.get(
          classroomToDepartmentMap.get(order.classroom_id ?? "") ?? ""
        ) ?? "N/A";
      const team = order.team_id ? allTeams.get(order.team_id) : undefined; // Get full team object
      const teamName = team ? team.name : undefined; // Use team.name
      const teamType = team ? team.team_type : undefined; // Get team type
      return { ...order, departmentName, teamName, teamType }; // Add teamType
    });
  }, [
    filteredOrders,
    currentPage,
    itemsPerPage,
    classroomToDepartmentMap,
    departmentMap,
    allTeams,
  ]);

  const handleExport = useCallback(() => {
    const dataToExport = filteredOrders.map((order: Order) => ({
      เล่มที่: order.book?.bookNumber || order.book_id,
      เลขที่: order.number,
      ชื่อลูกค้า: order.customerName,
      รายละเอียดสินค้า: order.order_items
        .map((item: OrderItem) => {
          return `${item.productName} (${item.pound} ปอนด์ ${item.quantity} ชิ้น)`;
        })
        .join(", "),
      เบอร์โทรศัพท์: order.phone,
      ยอดมัดจำ: order.deposit,
      ยอดรวม: order.totalPrice,
      วันที่รับเค้ก: new Date(order.pickup_date).toLocaleDateString("th-TH"),
      สถานะ: order.status === "pending" ? "รอดำเนินการ" : "เสร็จสิ้น",
      ครูที่ปรึกษา: order.advisor,
      แผนก: classroomToDepartmentMap.get(order.classroom_id ?? "") ?? "N/A",
      ทีม: allTeams.get(order.team_id ?? "") ?? "N/A", // Add team to export
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  }, [filteredOrders, classroomToDepartmentMap, allTeams]); // Add allTeams to dependencies

  const handleDeleteAllOrders = useCallback(async () => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการล้างข้อมูลคำสั่งซื้อทั้งหมดหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ล้างเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await deleteAllOrders();
        revalidate();
        Swal.fire("ลบแล้ว!", "คำสั่งซื้อทั้งหมดถูกลบเรียบร้อยแล้ว", "success");
      } catch (error) {
        Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการลบคำสั่งซื้อ", "error");
      }
    }
  }, [revalidate]);

  const handleEditOrder = useCallback((order: Order) => {
    setSelectedOrderForAction(order);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedOrderForAction(null);
    revalidate(); // Re-fetch orders after successful edit
  }, [revalidate]);

  const handleDeleteOrder = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrderForAction(order);
      setIsDeleteConfirmModalOpen(true);
    }
  }, [orders]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedOrderForAction) {
      try {
        await deleteOrder(selectedOrderForAction.id!);
        revalidate();
        showAlertSuccess({ title: "ลบสำเร็จ!", text: "คำสั่งซื้อถูกลบเรียบร้อยแล้ว" });
      } catch (error) {
        console.error("Error deleting order:", error);
        showAlertError({ title: "เกิดข้อผิดพลาด!", text: "ไม่สามารถลบคำสั่งซื้อได้" });
      } finally {
        setIsDeleteConfirmModalOpen(false);
        setSelectedOrderForAction(null);
      }
    }
  }, [selectedOrderForAction, revalidate]);

  const handleCloseDeleteConfirmModal = useCallback(() => {
    setIsDeleteConfirmModalOpen(false);
    setSelectedOrderForAction(null);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((term: string) => {
    setFilterTerm(term);
    setCurrentPage(1);
  }, []);

  const handleDepartmentFilterChange = useCallback((term: string) => {
    setDepartmentFilter(term);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((term: string) => {
    setStatusFilter(term);
    setCurrentPage(1);
  }, []);

  const handleTeamFilterChange = useCallback((term: string) => {
    setTeamFilter(term);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-11/12 mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-sm shadow-md p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <svg
                  className="w-10 h-10 mr-4 text-blue-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                จัดการคำสั่งซื้อ
              </h1>
              <p className="text-blue-200 text-lg">รายการคำสั่งซื้อทั้งหมด</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-200 mb-1">
                  ยอดคำสั่งซื้อทั้งหมด
                </div>
                <div className="text-3xl font-bold">
                  {filteredOrders.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <OrdersActionBar
          searchTerm={searchTerm}
          dateFilter={filterTerm}
          departmentFilter={departmentFilter}
          statusFilter={statusFilter}
          teamFilter={teamFilter} // Pass teamFilter
          onSearchChange={handleSearchChange}
          onDateFilterChange={handleFilterChange}
          onDepartmentFilterChange={handleDepartmentFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          onTeamFilterChange={handleTeamFilterChange} // Pass handleTeamFilterChange
          onExport={handleExport}
          deleteOrder={handleDeleteAllOrders}
          totalSalesPounds={totalSalesPounds}
          totalSalesBaht={totalSalesBaht}
          allTeams={allTeams} // Pass allTeams data
        />

        <OrdersTable
          orders={paginatedOrders}
          onDeleteOrder={handleDeleteOrder}
          onEditOrder={handleEditOrder} // Pass handleEditOrder
          currentUser={currentUser} // Pass currentUser
          showActions={true} // Ensure actions are shown
        />

        <OrdersPagination
          totalOrders={filteredOrders.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
      {/* Modals */}
      {isEditModalOpen && selectedOrderForAction && (
        <OrderEditModal
          order={selectedOrderForAction}
          onClose={handleCloseEditModal}
          isOpen={isEditModalOpen}
          onOrderEdited={revalidate} // Revalidate after edit
        />
      )}
      {isDeleteConfirmModalOpen && selectedOrderForAction && (
        <OrderDeleteConfirmModal
          order={selectedOrderForAction}
          onClose={handleCloseDeleteConfirmModal}
          isOpen={isDeleteConfirmModalOpen}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Orders;

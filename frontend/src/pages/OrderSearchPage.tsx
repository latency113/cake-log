import React, { useState, useEffect, useCallback } from "react";
import OrdersTable from "../components/orders/OrdersTable";
import OrderSearchActionBar from "../components/orders/OrderSearchActionBar";
import OrdersPagination from "../components/orders/OrdersPagination";
import { deleteOrder, getAllOrders } from "../utils/api/orders";
import { getClassrooms } from "../utils/api/data";
import { getProducts } from "../utils/api/products";
import { getDepartments } from "../utils/api/departments";
import { getTeams } from "../utils/api/teams";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Classroom,
  Department,
  Order,
  OrderItem,
  User,
  Team,
} from "@/types";
import { getUsers } from "@/utils/api/users";
import { showAlertError, showAlertSuccess } from "@/utils/alerts";
import OrderDeleteConfirmModal from "@/components/orders/OrderDeleteConfirmModal";
import OrderEditModal from "@/components/orders/OrderEditModal";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import { useNavigate } from "@tanstack/react-router"; // Import useNavigate
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OrderSearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize navigate hook
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showUserOrdersOnly, setShowUserOrdersOnly] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(-1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const fetchOrdersAndEnrich = useCallback(async () => {
    try {
      const [
        fetchedOrders,
        fetchedDepartments,
        fetchedProducts,
        fetchedClassrooms,
        fetchedUsers,
        fetchedTeams,
      ] = await Promise.all([
        getAllOrders(1, 9999),
        getDepartments(),
        getProducts(),
        getClassrooms(1, 9999),
        getUsers(1, 9999),
        getTeams(),
      ]);

      setAllDepartments(fetchedDepartments.data);

      const departmentMap = new Map<string, string>();
      fetchedDepartments.data.forEach((department) => {
        departmentMap.set(department.id, department.name);
      });

      const productMap = new Map<string, string>();
      fetchedProducts.forEach((product) => {
        productMap.set(product.id, product.name);
      });

      const classroomToDepartmentMap = new Map<string, string>(
        fetchedClassrooms.map((classroom: Classroom) => [
          classroom.id,
          classroom.department_id,
        ])
      );

      const usersMap = new Map<string, User>();
      fetchedUsers.data.forEach((user: User) => {
        usersMap.set(user.id, user);
      });

      const teamMap = new Map<string, Team>();
      fetchedTeams.data.forEach((team) => {
        teamMap.set(team.id, team);
      });

      const enrichedOrders = fetchedOrders.map((order) => {
        let effectiveDepartmentId = order.department_id;
        if (!effectiveDepartmentId && order.classroom_id) {
          effectiveDepartmentId = classroomToDepartmentMap.get(
            order.classroom_id
          );
        }

        const enrichedOrderItems = order.order_items.map((item: OrderItem) => ({
          ...item,
          productName: productMap.get(item.product_id) || "Unknown Product",
        }));

        const team = order.team_id ? teamMap.get(order.team_id) : undefined;
        const teamName = team ? team.name : undefined;
        const teamType = team ? team.team_type : undefined;

        return {
          ...order,
          departmentName: effectiveDepartmentId
            ? departmentMap.get(effectiveDepartmentId)
            : undefined,
          effectiveDepartmentId: effectiveDepartmentId,
          orderItems: enrichedOrderItems,
          user: usersMap.get(order.user_id),
          teamName: teamName,
          teamType: teamType,
        };
      });

      setOrders(enrichedOrders);
      setFilteredOrders(enrichedOrders);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      // setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdersAndEnrich();
  }, [fetchOrdersAndEnrich]);

  useEffect(() => {
    let tempOrders = orders;

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(lowercasedSearchTerm) ||
          order.book_id.toString().includes(lowercasedSearchTerm) ||
          order.number.toString().includes(lowercasedSearchTerm) ||
          order.phone.includes(lowercasedSearchTerm)
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
      const firstDayOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      tempOrders = tempOrders.filter(
        (order) => new Date(order.pickup_date) >= firstDayOfWeek
      );
    } else if (filterTerm === "this_month") {
      tempOrders = tempOrders.filter(
        (order) =>
          new Date(order.pickup_date).getMonth() === now.getMonth() &&
          new Date(order.pickup_date).getFullYear() === now.getFullYear()
      );
    }

    if (departmentFilter !== "all") {
      tempOrders = tempOrders.filter(
        (order) => order.effectiveDepartmentId === departmentFilter
      );
    }

    if (user && showUserOrdersOnly) {
      tempOrders = tempOrders.filter((order) => order.user_id === user.id);
    }

    setFilteredOrders(tempOrders);
    setCurrentPage(1);
  }, [
    searchTerm,
    filterTerm,
    departmentFilter,
    orders,
    user,
    showUserOrdersOnly,
  ]);

  useEffect(() => {
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    setPaginatedOrders(
      filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    );
  }, [currentPage, itemsPerPage, filteredOrders]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (num: number) => {
    setItemsPerPage(num);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterTerm(value);
  };

  const handleDepartmentFilterChange = (departmentId: string) => {
    setDepartmentFilter(departmentId);
  };

  const handleOrderRowClick = (order: Order) => {
    const index = filteredOrders.findIndex((o) => o.id === order.id);
    setSelectedOrder(order);
    setCurrentOrderIndex(index);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedOrder(null);
      setCurrentOrderIndex(-1);
    }, 300);
  };

  const handleNavigateOrder = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < filteredOrders.length) {
      setSelectedOrder(filteredOrders[newIndex]);
      setCurrentOrderIndex(newIndex);
    }
  };

  const handleEditOrder = (order: Order) => {
    if (
      order.classroom?.isOrderFinalized &&
      user?.role !== "ADMIN" &&
      user?.role !== "SUPERADMIN"
    ) {
      showAlertError({
        title: "ไม่สามารถแก้ไขได้",
        text: "ออเดอร์นี้ถูกสรุปยอดไปแล้ว สามารถแก้ไขได้โดยแอดมินเท่านั้น",
      });
      return;
    }
    setOrderToEdit(order);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setOrderToEdit(null);
    fetchOrdersAndEnrich();
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      if (
        order.classroom?.isOrderFinalized &&
        user?.role !== "ADMIN" &&
        user?.role !== "SUPERADMIN"
      ) {
        showAlertError({
          title: "ไม่สามารถลบได้",
          text: "ออเดอร์นี้ถูกสรุปยอดไปแล้ว สามารถลบได้โดยแอดมินเท่านั้น",
        });
        return;
      }
      setOrderToDelete(order);
      setIsDeleteConfirmModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete.id!);
        fetchOrdersAndEnrich();
        showAlertSuccess({
          title: "ลบสำเร็จ!",
          text: "คำสั่งซื้อถูกลบเรียบร้อยแล้ว",
        });
      } catch (error) {
        console.error("Error deleting order:", error);
        showAlertError({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถลบคำสั่งซื้อได้",
        });
      } finally {
        setIsDeleteConfirmModalOpen(false);
        setOrderToDelete(null);
      }
    }
  };

  const handleCloseDeleteConfirmModal = () => {
    setIsDeleteConfirmModalOpen(false);
    setOrderToDelete(null);
  };

  // Function to handle showing classroom summary
  const handleShowClassroomSummaryPage = () => {
    navigate({ to: "/classroom-cake-summary" });
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">ข้อผิดพลาด: {error}</div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/home" })}
          className="flex items-center font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ย้อนกลับ
        </Button>
      </div>

      <div className="flex justify-center items-center mb-4">
        <h2 className="text-2xl font-bold">ค้นหาออเดอร์เค้ก</h2>
      </div>
      <div className="flex justify-center">
        <div className="w-4/5">
          <OrderSearchActionBar
            searchTerm={searchTerm}
            filterTerm={filterTerm}
            DepartmentFilter={departmentFilter} // Corrected prop name
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onDepartmentFilterChange={handleDepartmentFilterChange}
            allDepartments={allDepartments}
            showUserOrdersOnly={showUserOrdersOnly}
            onShowUserOrdersOnlyChange={setShowUserOrdersOnly}
            onShowClassroomSummary={handleShowClassroomSummaryPage} // Navigate to new page
          />

          <OrdersTable
            orders={paginatedOrders}
            onRowClick={handleOrderRowClick}
            showActions={true}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            currentUser={user}
          />

          <OrdersPagination
            totalOrders={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
      {selectedOrder && (
        <>
          <OrderDetailModal
            order={selectedOrder}
            onClose={handleCloseDetailModal}
            isOpen={isDetailModalOpen}
            orderList={filteredOrders}
            currentOrderIndex={currentOrderIndex}
            onNavigate={handleNavigateOrder}
            currentUser={user}
          />
        </>
      )}
      {orderToEdit && (
        <OrderEditModal
          order={orderToEdit}
          onClose={handleCloseEditModal}
          isOpen={isEditModalOpen}
          onOrderEdited={fetchOrdersAndEnrich}
        />
      )}
      {orderToDelete && (
        <OrderDeleteConfirmModal
          order={orderToDelete}
          onClose={handleCloseDeleteConfirmModal}
          isOpen={isDeleteConfirmModalOpen}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default OrderSearchPage;

import React, { useState, useEffect, useCallback } from "react";
import OrdersTable from "../components/orders/OrdersTable";
import OrderSearchActionBar from "../components/orders/OrderSearchActionBar";
import OrdersPagination from "../components/orders/OrdersPagination";
import { deleteOrder, getOrdersPaginated } from "../utils/api/orders";
import { getDepartments } from "../utils/api/departments";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Department,
  Order,
} from "@/types";
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showUserOrdersOnly, setShowUserOrdersOnly] = useState<boolean>(true);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getDepartments()
      .then((res) => setAllDepartments(res.data || []))
      .catch((err) => console.error("Failed to fetch departments:", err));
  }, []);

  const fetchOrdersAndEnrich = useCallback(async () => {
    try {
      const departmentMap = new Map(
        allDepartments.map((department) => [department.id, department.name])
      );

      const res = await getOrdersPaginated({
        page: currentPage,
        itemsPerPage,
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        ...(showUserOrdersOnly && user?.id ? { user_id: user.id } : {}),
        ...(departmentFilter !== "all" ? { department_id: departmentFilter } : {}),
        ...(filterTerm !== "all"
          ? { pickup_filter: filterTerm as "today" | "this_week" | "this_month" }
          : {}),
      });

      const enrichedOrders = res.data.map((order) => {
        const effectiveDepartmentId =
          order.department_id || order.classroom?.department_id;
        return {
          ...order,
          effectiveDepartmentId,
          departmentName: effectiveDepartmentId
            ? departmentMap.get(effectiveDepartmentId) || "N/A"
            : "N/A",
        };
      });

      setFilteredOrders(enrichedOrders);
      setTotalOrders(res.meta_data?.total ?? enrichedOrders.length);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    showUserOrdersOnly,
    user?.id,
    departmentFilter,
    filterTerm,
    allDepartments,
  ]);

  useEffect(() => {
    fetchOrdersAndEnrich();
  }, [fetchOrdersAndEnrich]);

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
    setCurrentPage(1);
  };

  const handleDepartmentFilterChange = (departmentId: string) => {
    setDepartmentFilter(departmentId);
    setCurrentPage(1);
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
    const order = filteredOrders.find((o) => o.id === orderId);
    if (order) {
      if (order.classroom?.isOrderFinalized || order.book?.isClosed) {
        showAlertError({
          title: "ไม่สามารถลบได้",
          text: "สมุดจองเล่มนี้สรุปยอดแล้ว ไม่สามารถลบคำสั่งซื้อได้",
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
    <div className="container mx-auto px-3 sm:px-6 py-4 max-w-7xl">
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              navigate({ to: "/home", search: {} });
            }
          }}
          className="flex items-center font-medium text-xs sm:text-sm"
        >
          <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4" />
          ย้อนกลับ
        </Button>
      </div>

      <div className="flex justify-center items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">ค้นหาออเดอร์เค้ก</h2>
      </div>

      <div className="w-full space-y-4">
        <OrderSearchActionBar
          searchTerm={searchTerm}
          filterTerm={filterTerm}
          DepartmentFilter={departmentFilter} // Corrected prop name
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onDepartmentFilterChange={handleDepartmentFilterChange}
          allDepartments={allDepartments}
          showUserOrdersOnly={showUserOrdersOnly}
          onShowUserOrdersOnlyChange={(checked) => {
            setShowUserOrdersOnly(checked);
            setCurrentPage(1);
          }}
          onShowClassroomSummary={handleShowClassroomSummaryPage} // Navigate to new page
        />

        <OrdersTable
          orders={filteredOrders}
          onRowClick={handleOrderRowClick}
          showActions={true}
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder}
          currentUser={user}
        />

        <OrdersPagination
          totalOrders={totalOrders}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
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

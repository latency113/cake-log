import React, { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../utils/api/orders";
import { getClassrooms } from "../../utils/api/data";
import { getDepartments } from "@/utils/api/departments";
import OfficerOrderListSkeleton from "./skeletons/OfficerOrderListSkeleton";
import {
  showToastSuccess,
  showToastError,
  showToastWarning,
} from "@/utils/alerts";
import OrderDetailModal from "../orders/OrderDetailModal";
import type { Order } from "@/types/order";
import OrderListHeader from "./order-list/OrderListHeader";
import OrderFilters from "./order-list/OrderFilters";
import SearchedOrderCard from "./order-list/SearchedOrderCard";
import OrderStats from "./order-list/OrderStats";
// import OrderPoundChart from "./order-list/OrderPoundChart";
import OrderTable from "./order-list/OrderTable";
import ConfirmPickupDialog from "./order-list/ConfirmPickupDialog";
import ErrorDisplay from "./order-list/ErrorDisplay";
import { useAuth } from "../../contexts/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

const ITEMS_PER_PAGE = 15;

interface OfficerOrderListProps {}

const OfficerOrderList: React.FC<OfficerOrderListProps> = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();
  // const [poundStats, setPoundStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allClassrooms, setAllClassrooms] = useState<any[]>([]);
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | "all"
  >("all");
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "complete"
  >("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [selectedPickupDate, setSelectedPickupDate] = useState<string | "all">(
    "all"
  );
  const [availablePickupDates, setAvailablePickupDates] = useState<string[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (orders.length > 0) {
      const uniqueDates = Array.from(
        new Set(
          orders.map(
            (order) => new Date(order.pickup_date).toISOString().split("T")[0]
          )
        )
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      setAvailablePickupDates(uniqueDates);

      const today = new Date().toISOString().split("T")[0];
      if (uniqueDates.includes(today)) {
        setSelectedPickupDate(today);
      } else if (uniqueDates.length > 0) {
        setSelectedPickupDate(uniqueDates[uniqueDates.length - 1]); // Changed to pick the latest date
      } else {
        setSelectedPickupDate("all");
      }
    }
  }, [orders]);

  useEffect(() => {
    fetchOrdersAndStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset page when filters or search change

    // Exact match search for order number
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && !isNaN(Number(trimmedQuery))) {
      const exactMatch = orders.find(
        (order) => order.number.toString() === trimmedQuery
      );
      setSearchedOrder(exactMatch || null);

      if (exactMatch && exactMatch.status === "complete") {
        showToastWarning({
          title: "จ่ายเค้กเรียบร้อยแล้ว",
          text: `ออเดอร์หมายเลข ${exactMatch.number} ถูกจ่ายไปแล้ว`,
        });
      }
    } else {
      setSearchedOrder(null);
    }

    let currentOrders = orders;

    if (trimmedQuery) {
      const query = trimmedQuery.toLowerCase();
      currentOrders = currentOrders.filter(
        (order) =>
          order.number?.toString().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.phone?.includes(query)
      );
    }

    // Apply pickup date filter ONLY if there is no active search query
    if (selectedPickupDate !== "all" && !trimmedQuery) {
      currentOrders = currentOrders.filter(
        (order) =>
          new Date(order.pickup_date).toISOString().split("T")[0] ===
          selectedPickupDate
      );
    }

    if (selectedDepartmentId !== "all") {
      currentOrders = currentOrders.filter(
        (order) =>
          order.department_id === selectedDepartmentId ||
          (order.classroom_id &&
            allClassrooms.find(
              (cls) =>
                cls.id === order.classroom_id &&
                cls.department_id === selectedDepartmentId
            ))
      );
    }

    if (statusFilter !== "all") {
      currentOrders = currentOrders.filter(
        (order) => order.status === statusFilter
      );
    } else {
      currentOrders = currentOrders.filter(
        (order) => order.status === "complete" || order.status === "approved" // ONLY show approved orders as default when 'all' is selected for statusFilter
      );
    }

    // Sort by order number
    const sortedOrders = currentOrders.sort(
      (a, b) => parseInt(a.number) - parseInt(b.number)
    );

    console.log(
      "DEBUG: Status Filter:",
      statusFilter,
      "Current orders length before setting displayOrders:",
      sortedOrders.length
    );

    setDisplayOrders(sortedOrders);
  }, [
    orders,
    selectedDepartmentId,
    statusFilter,
    searchQuery,
    allClassrooms,
    selectedPickupDate,
  ]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedOrders(displayOrders.slice(startIndex, endIndex));
  }, [displayOrders, currentPage]);

  const fetchOrdersAndStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedOrders, fetchedDepartments, fetchedClassrooms] = await Promise.all([
        getAllOrders(1, 9999),
        getDepartments(),
        getClassrooms(1, 999),
      ]);

      setAllDepartments(fetchedDepartments.data);
      setAllClassrooms(fetchedClassrooms);

      const departmentMap = new Map(
        fetchedDepartments.data.map((dep: any) => [dep.id, dep.name])
      );
      const classroomToDepartmentMap = new Map<string, string | undefined>(
        fetchedClassrooms.map((cls: any) => [cls.id, cls.department_id])
      );

      const ordersWithDepartmentNames = fetchedOrders.map((order: any) => {
        let effectiveDepartmentId = order.department_id;
        if (!effectiveDepartmentId && order.classroom_id) {
          effectiveDepartmentId = classroomToDepartmentMap.get(
            order.classroom_id
          );
        }

        const departmentName = effectiveDepartmentId
          ? departmentMap.get(effectiveDepartmentId) || "Unknown Branch"
          : "Unknown Branch";

        return {
          ...order,
          departmentName,
          order_items: order.order_items ?? [],
        };
      });

      setOrders(ordersWithDepartmentNames);
    } catch (err) {
      setError("Failed to fetch orders or calculate branch statistics.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailsClick = (order: any) => {
    setSelectedOrder(order);
  };

  const handleMarkAsPickedUpClick = () => {
    // The order object is passed from the modal, but selectedOrder is already set.
    // We just need to open the confirmation dialog.
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmPickup = async () => {
    if (!selectedOrder) return;

    if (!user?.id) {
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่พบข้อมูลผู้ใช้งาน",
      });
      return;
    }

    try {
      await updateOrderStatus(selectedOrder.id, "complete", undefined, user.id, new Date().toISOString());

      // 1. ปิด Dialog และ Modal ก่อน
      setIsConfirmDialogOpen(false);
      setSelectedOrder(null);

      // 2. แสดงแจ้งเตือนสำเร็จ (ใส่ await เพื่อให้ user เห็นแวบหนึ่งก่อนรีโหลด หรือไม่ใส่ก็ได้)
      showToastSuccess({
        title: "จ่ายออเดอร์สำเร็จ",
        text: `ออเดอร์ #${selectedOrder.number} ถูกจ่ายเรียบร้อยแล้ว`,
      });

      // 3. รีโหลดหน้าเว็บทั้งหมด
      // ใช้ setTimeout เล็กน้อยเพื่อให้ Toast ได้เริ่มแสดงผล หรือสั่ง reload ทันทีก็ได้
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัพเดทสถานะออเดอร์ได้",
      });
      console.error(err);
    }
  };

  if (loading) {
    return <OfficerOrderListSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const approvedAndCompletedOrders = displayOrders.filter(
    (order) => order.status === "approved" || order.status === "complete"
  );
  const totalOrders = approvedAndCompletedOrders.length;
  const completedOrders = displayOrders.filter(
    (order) => order.status === "complete"
  ).length;
  const pendingOrders = displayOrders.filter(
    (order) => order.status === "approved"
  ).length;

  const totalPages = Math.ceil(displayOrders.length / ITEMS_PER_PAGE);

  // Debugging console log for pagination
  console.log(
    `Pagination Debug: Page ${currentPage} of ${totalPages}. Items on current page: ${paginatedOrders.length}. Total filtered items: ${displayOrders.length}`
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <OrderListHeader />
          <OrderFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedDepartmentId={selectedDepartmentId}
            setSelectedDepartmentId={setSelectedDepartmentId}
            allDepartments={allDepartments}
            selectedPickupDate={selectedPickupDate}
            setSelectedPickupDate={setSelectedPickupDate}
            availablePickupDates={availablePickupDates}
          />
        </div>

        <SearchedOrderCard
          order={searchedOrder}
          onViewDetails={handleViewDetailsClick}
        />

        <OrderStats
          totalOrders={totalOrders}
          completedOrders={completedOrders}
          pendingOrders={pendingOrders}
        />

        {/* <OrderPoundChart poundStats={poundStats} /> */}

        <OrderTable
          orders={paginatedOrders} // Use paginatedOrders here
          onViewDetails={handleViewDetailsClick}
        />

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {(() => {
                  const getPaginationItems = () => {
                    const pageNumbersSet = new Set<number>();
                    const numPagesToShowAroundCurrent = 1; // How many page numbers to show directly around current page

                    // Always add the first page
                    if (totalPages > 0) {
                      pageNumbersSet.add(1);
                    }

                    // Add pages around the current page
                    for (
                      let i = currentPage - numPagesToShowAroundCurrent;
                      i <= currentPage + numPagesToShowAroundCurrent;
                      i++
                    ) {
                      if (i > 1 && i < totalPages) {
                        // Exclude 1 and totalPages as they are handled separately
                        pageNumbersSet.add(i);
                      }
                    }

                    // Always add the last page
                    if (totalPages > 1) {
                      pageNumbersSet.add(totalPages);
                    }

                    const sortedPageNumbers = Array.from(pageNumbersSet).sort(
                      (a, b) => a - b
                    );

                    const finalPages: (number | string)[] = [];
                    let lastPageAdded: number | null = null;

                    for (const pageNum of sortedPageNumbers) {
                      if (
                        lastPageAdded !== null &&
                        pageNum > lastPageAdded + 1
                      ) {
                        finalPages.push("...");
                      }
                      finalPages.push(pageNum);
                      lastPageAdded = pageNum;
                    }
                    return finalPages;
                  };

                  const paginationItems = getPaginationItems();

                  return paginationItems.map((pageNumber, index) => (
                    <PaginationItem key={index}>
                      {pageNumber === "..." ? (
                        <span className="px-3 py-1.5 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber as number);
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <ConfirmPickupDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleConfirmPickup}
          order={selectedOrder}
          dialogTitle="ยืนยันการจ่ายออเดอร์"
          dialogDescription="คุณต้องการยืนยันว่าลูกค้าได้รับออเดอร์แล้วหรือไม่?"
          confirmButtonText="ยืนยันการจ่ายออเดอร์"
        />

        <OrderDetailModal
          isOpen={!!selectedOrder}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onMarkAsPickedUp={handleMarkAsPickedUpClick}
        />
      </div>
    </div>
  );
};

export default OfficerOrderList;

import { useState, useMemo } from "react";
import usePendingOrdersData from "../../hooks/usePendingOrdersData";
import OfficerPrepareOrderDetailModal from "../../components/officer/order-prepare/OfficerPrepareOrderDetailModal";
import type { Order } from "../../types";
import { updateOrderStatus } from "../../utils/api/orders";
import { OrderStatus } from "../../types/common";
import { toast } from "sonner";
import OrderCard from "../../components/orders/OrderCard";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmPickupDialog from "../../components/officer/order-list/ConfirmPickupDialog";
import OfficerNavbar from "../../components/layout/OfficerNavbar";
import OfficerPreparePageSkeleton from "./skeletons/OfficerPreparePageSkeleton";
import { Package, Calendar, Search, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Assuming this path for Select components

const ITEMS_PER_PAGE = 15;

function OfficerPreparePage() {
  const { pendingOrders, loading, revalidate } = usePendingOrdersData();
  const { user, logout } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmPrepareDialogOpen, setIsConfirmPrepareDialogOpen] =
    useState(false);
  // Removed expandedDates state as dates will be selected, not expanded
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Single currentPage state

  const [selectedDisplayDate, setSelectedDisplayDate] = useState<string | null>(
    null
  ); // State for chosen date

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handlePrepareOrderClick = () => {
    setIsConfirmPrepareDialogOpen(true);
  };

  const handleConfirmPrepare = async () => {
    if (!selectedOrder) return;

    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      await updateOrderStatus(
        selectedOrder.id,
        OrderStatus.APPROVED,
        user.id
      );
      toast.success("จัดเตรียมออเดอร์สำเร็จ!");
      revalidate();
      handleCloseDetailModal();
      setIsConfirmPrepareDialogOpen(false);
    } catch (error) {
      console.error(
        "Error preparing order:",
        error);
      toast.error("ไม่สามารถจัดเตรียมออเดอร์ได้");
    }
  };

  const allOrdersGroupedForPicker = useMemo(() => {
    const groups: { [date: string]: Order[] } = {};
    pendingOrders.forEach((order) => {
      const date = new Date(order.pickup_date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });
    return groups;
  }, [pendingOrders]);

  // Sort dates chronologically for the date picker
  const sortedDatesForPicker = useMemo(() => {
    return Object.keys(allOrdersGroupedForPicker).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [allOrdersGroupedForPicker]);

  const ordersForCurrentDisplayAndSearch = useMemo(() => {
    let ordersToProcess = pendingOrders;
    // console.log(
    //   "DEBUG: Initial pendingOrders length:",
    //   pendingOrders.length,
    //   "searchTerm:",
    //   searchTerm
    // );

    // Apply search term first to ALL pending orders if present
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      console.log(
        "DEBUG: Before search filter, ordersToProcess length:",
        ordersToProcess.length
      );
      ordersToProcess = ordersToProcess.filter((order) => {
        const orderNumberString = order.number.toString();
        const includesSearchTerm = orderNumberString.includes(lowerSearchTerm);
        console.log(
          `DEBUG: Comparing order.number (${orderNumberString}) with searchTerm (${lowerSearchTerm}). Includes: ${includesSearchTerm}`
        );
        return includesSearchTerm;
      });
      console.log(
        "DEBUG: After search filter, ordersToProcess length:",
        ordersToProcess.length
      );
    } else if (selectedDisplayDate) {
      // If no search term, then filter by the selected display date
      ordersToProcess = ordersToProcess.filter((order) => {
        const orderDate = new Date(order.pickup_date).toLocaleDateString(
          "th-TH",
          {
            year: "numeric",
            month: "long",
            day: "2-digit",
          }
        );
        return orderDate === selectedDisplayDate;
      });
    }
    // Sort orders by number in ascending order
    ordersToProcess.sort((a, b) => Number(a.number) - Number(b.number));

    return ordersToProcess;
  }, [pendingOrders, searchTerm, selectedDisplayDate]);

  // Group the final orders by date and status for rendering purposes
  const groupedOrdersForRendering = useMemo(() => {
    const groups: {
      [date: string]: {
        pending: Order[];
        approved: Order[];
        complete: Order[];
      };
    } = {};
    ordersForCurrentDisplayAndSearch.forEach((order) => {
      const date = new Date(order.pickup_date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
      if (!groups[date]) {
        groups[date] = { pending: [], approved: [], complete: [] };
      }
      if (order.status === OrderStatus.PENDING) {
        groups[date].pending.push(order);
      } else if (order.status === OrderStatus.APPROVED) {
        groups[date].approved.push(order);
      } else if (order.status === OrderStatus.COMPLETE) {
        groups[date].complete.push(order);
      }
    });

    return groups;
  }, [ordersForCurrentDisplayAndSearch]);

  const currentTotalOrdersCount = ordersForCurrentDisplayAndSearch.length;
  const totalPages = Math.ceil(currentTotalOrdersCount / ITEMS_PER_PAGE);

  // Flatten the grouped orders for pagination only
  const flatOrdersForPagination = useMemo(() => {
    const flat = Object.values(groupedOrdersForRendering).flatMap((group) => [
      ...group.pending,
      ...group.approved,
      ...group.complete,
    ]);

    return flat;
  }, [groupedOrdersForRendering]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = flatOrdersForPagination.slice(startIndex, endIndex);

    return paginated;
  }, [flatOrdersForPagination, currentPage]);

  // Re-group the paginated orders by date and status to render them with date headers and status groups
  const paginatedAndGroupedOrders = useMemo(() => {
    const groups: {
      [date: string]: {
        pending: Order[];
        approved: Order[];
        complete: Order[];
      };
    } = {};
    paginatedOrders.forEach((order) => {
      const date = new Date(order.pickup_date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
      if (!groups[date]) {
        groups[date] = { pending: [], approved: [], complete: [] };
      }
      if (order.status === OrderStatus.PENDING) {
        groups[date].pending.push(order);
      } else if (order.status === OrderStatus.APPROVED) {
        groups[date].approved.push(order);
      } else if (order.status === OrderStatus.COMPLETE) {
        groups[date].complete.push(order);
      }
    });

    return groups;
  }, [paginatedOrders]);

  const sortedPaginatedAndGroupedDates = useMemo(() => {
    const sorted = Object.keys(paginatedAndGroupedOrders).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sorted;
  }, [paginatedAndGroupedOrders]);

  if (loading) {
    return <OfficerPreparePageSkeleton />;
  }

  const handleLogout = () => {
    logout();
  };
  return (
    <div className="min-h-screen bg-background pb-20 ">
      <OfficerNavbar handleLogout={handleLogout} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground mb-3">
            ออเดอร์ที่ต้องจัดเตรียม
          </h1>

          {/* Date Selector */}
          <div className="relative mb-3">
            <label htmlFor="date-selector" className="sr-only">
              เลือกวันที่
            </label>
            <Select
              value={selectedDisplayDate || ""}
              onValueChange={(value) => {
                setSelectedDisplayDate(value);
                setCurrentPage(1); // Reset page on date change
              }}
              disabled={sortedDatesForPicker.length === 0}
            >
              <SelectTrigger
                id="date-selector"
                className="w-full h-10 px-3 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-background disabled:bg-muted disabled:text-muted-foreground"
              >
                <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="เลือกวันที่..." />
              </SelectTrigger>
              <SelectContent>
                {sortedDatesForPicker.map((date) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page directly when search term changes
              }}
              placeholder="ค้นหาเลขที่ออเดอร์..."
              className="w-full pl-10 pr-10 py-2.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <Package className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                {currentTotalOrdersCount} รายการ
                {searchTerm && (
                  <span className="text-emerald-300"> (กรองแล้ว)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {currentTotalOrdersCount === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-muted border border-border rounded-full flex items-center justify-center">
              {searchTerm ? (
                <Search className="w-10 h-10 text-muted-foreground" />
              ) : (
                <Calendar className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "ไม่พบออเดอร์" : "ยังไม่มีออเดอร์สำหรับวันนี้"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? "ไม่พบออเดอร์ที่ตรงกับการค้นหา"
                : "ยังไม่มีออเดอร์ที่ต้องจัดเตรียมสำหรับวันที่เลือก"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <X className="w-4 h-4" />
                ล้างการค้นหา
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPaginatedAndGroupedDates.map((date) => {
              const ordersForThisDate = paginatedAndGroupedOrders[date];
              const fullOrdersForThisDate = groupedOrdersForRendering[date];
              const totalOrdersForThisDate =
                (fullOrdersForThisDate?.pending?.length || 0) +
                (fullOrdersForThisDate?.approved?.length || 0) +
                (fullOrdersForThisDate?.complete?.length || 0);

              if (totalOrdersForThisDate === 0) return null; // Don't render date header if no orders

              return (
                <div key={date}>
                  {/* Date Header for this date */}
                  <div className="py-3 -mx-4 px-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                      <div className="flex items-center gap-2 flex-1">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-semibold text-foreground">
                          {date}
                        </h2>
                      </div>
                      <span className="px-2.5 py-1 bg-muted border border-border text-muted-foreground text-xs font-medium rounded-full">
                        {totalOrdersForThisDate}
                      </span>
                    </div>
                  </div>

                  {/* Order Cards for this date */}
                  <div className="space-y-3">
                    {ordersForThisDate?.pending?.length > 0 && (
                      <>
                        <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                          รอจัดเตรียม ({fullOrdersForThisDate.pending.length})
                        </h3>
                        {ordersForThisDate.pending.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onClick={handleCardClick}
                          />
                        ))}
                      </>
                    )}

                    {ordersForThisDate?.approved?.length > 0 && (
                      <>
                        <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                          จัดเตรียมแล้ว ({fullOrdersForThisDate.approved.length})
                        </h3>
                        {ordersForThisDate.approved.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onClick={handleCardClick}
                          />
                        ))}
                      </>
                    )}

                    {ordersForThisDate?.complete?.length > 0 && (
                      <>
                        <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                          ส่งมอบเรียบร้อย ({fullOrdersForThisDate.complete.length})
                        </h3>
                        {ordersForThisDate.complete.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onClick={handleCardClick}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
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
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {/* Page numbers */}
                    {(() => {
                      const pageNumbers: (number | string)[] = [];
                      const delta = 1; // Number of pages to show around the current page

                      // Always show first page
                      pageNumbers.push(1);

                      // Calculate pages around currentPage
                      for (
                        let i = Math.max(2, currentPage - delta);
                        i <= Math.min(totalPages - 1, currentPage + delta);
                        i++
                      ) {
                        pageNumbers.push(i);
                      }

                      // Always show last page if more than one page
                      if (totalPages > 1) {
                        pageNumbers.push(totalPages);
                      }

                      // Add ellipses and remove duplicates
                      const uniquePageNumbers = Array.from(
                        new Set(pageNumbers)
                      ).sort((a, b) => {
                        if (a === "...") return 1; // Ellipses should be handled contextually, not sorted numerically
                        if (b === "...") return -1;
                        return (a as number) - (b as number);
                      });

                      const finalPageNumbers: (number | string)[] = [];
                      let lastPage = 0;
                      for (const page of uniquePageNumbers) {
                        if (typeof page === "number") {
                          if (page - lastPage > 1) {
                            finalPageNumbers.push("...");
                          }
                          finalPageNumbers.push(page);
                          lastPage = page;
                        }
                      }
                      // Add ellipsis at the end if the last page in finalPageNumbers is not totalPages
                      if (
                        finalPageNumbers.length > 0 &&
                        finalPageNumbers[finalPageNumbers.length - 1] !==
                          totalPages
                      ) {
                        // This case should ideally be covered by the loop, but as a safeguard
                        if (
                          totalPages -
                            (finalPageNumbers[
                              finalPageNumbers.length - 1
                            ] as number) >
                          1
                        ) {
                          finalPageNumbers.push("...");
                        }
                      }
                      // Handle case where totalPages is only 1, and it's duplicated
                      if (
                        finalPageNumbers.length > 1 &&
                        finalPageNumbers[0] === 1 &&
                        finalPageNumbers[1] === 1 &&
                        totalPages === 1
                      ) {
                        return [1].map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(p);
                              }}
                              isActive={currentPage === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ));
                      }
                      // If only totalPages (last item) is present, add 1 also.
                      if (
                        finalPageNumbers.length === 1 &&
                        finalPageNumbers[0] === totalPages &&
                        totalPages > 1
                      ) {
                        finalPageNumbers.unshift("...");
                        finalPageNumbers.unshift(1);
                      }
                      // If only 1 is present, and totalPages > 1, add ellipsis and totalPages
                      if (
                        finalPageNumbers.length === 1 &&
                        finalPageNumbers[0] === 1 &&
                        totalPages > 1
                      ) {
                        finalPageNumbers.push("...");
                        finalPageNumbers.push(totalPages);
                      }

                      return finalPageNumbers.map((pageNumber, index) => (
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
                    })()}{" "}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          );
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
          </div>
        )}

        {/* Handle case where no selected date and no orders after filtering/loading */}
        {/* This block is now covered by the currentTotalOrdersCount === 0 condition at the top */}
        {/* {!selectedDisplayDate && totalOrdersCount === 0 && !loading && (
            <div className="text-center py-16 text-muted-foreground">
              <p>เลือกวันที่เพื่อดูออเดอร์ หรือยังไม่มีออเดอร์</p>
            </div>
          )} */}
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedOrder && (
        <OfficerPrepareOrderDetailModal
          order={selectedOrder}
          onClose={handleCloseDetailModal}
          onApprove={handlePrepareOrderClick}
          showApproveButton={true}
        />
      )}

      <ConfirmPickupDialog
        isOpen={isConfirmPrepareDialogOpen}
        onOpenChange={setIsConfirmPrepareDialogOpen}
        onConfirm={handleConfirmPrepare}
        order={selectedOrder}
        dialogTitle="ยืนยันการจัดเตรียมออเดอร์"
        dialogDescription="คุณต้องการยืนยันว่าได้จัดเตรียมออเดอร์นี้เรียบร้อยแล้วหรือไม่?"
        confirmButtonText="ยืนยันการจัดเตรียม"
      />
    </div>
  );
}

export default OfficerPreparePage;

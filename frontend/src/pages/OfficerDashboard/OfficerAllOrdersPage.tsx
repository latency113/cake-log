import usePendingOrdersData from "../../hooks/usePendingOrdersData";
import OfficerAllOrdersTable from "../../components/officer/order-list/OfficerAllOrdersTable";
import { useAuth } from "../../contexts/AuthContext";
import OfficerAllOrdersPageSkeleton from "./skeletons/OfficerAllOrdersPageSkeleton";
import { useMemo, useState, useEffect } from "react";
import { Search, Calendar, SlidersHorizontal, Package } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/common/DatePicker";
import OrderDetailModal from "../../components/orders/OrderDetailModal"; // Import OrderDetailModal
import type { Order } from "../../types"; // Ensure Order type is imported
import OfficerNavbar from "@/components/layout/OfficerNavbar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

// Date range presets
const DATE_PRESETS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "today", label: "วันนี้" },
  { value: "yesterday", label: "เมื่อวาน" },
  { value: "last7days", label: "7 วันที่แล้ว" },
  { value: "last30days", label: "30 วันที่แล้ว" },
  { value: "lastMonth", label: "เดือนที่แล้ว" },
  { value: "custom", label: "กำหนดเอง" },
];

const ITEMS_PER_PAGE = 15;

function OfficerAllOrdersPage() {
  const { pendingOrders, loading } = usePendingOrdersData();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State for selected order
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State for modal visibility
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(-1); // New state for current order index
  const [currentPage, setCurrentPage] = useState(1); // State for current page in pagination

  // Calculate date range based on preset
  const getDateRange = (preset: string) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

    switch (preset) {
      case "today": {
        const endOfDay = new Date(today);
        endOfDay.setUTCHours(23, 59, 59, 999); // Set to UTC end of day
        return { start: today, end: endOfDay };
      }
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1); // Use UTC date methods
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setUTCHours(23, 59, 59, 999);
        return { start: yesterday, end: endOfYesterday };
      }
      case "last7days": {
        const start = new Date(today);
        start.setUTCDate(start.getUTCDate() - 7);
        const end = new Date();
        end.setUTCHours(23, 59, 59, 999); // Ensure end of day is UTC
        return { start, end };
      }
      case "last30days": {
        const start = new Date(today);
        start.setUTCDate(start.getUTCDate() - 30);
        const end = new Date();
        end.setUTCHours(23, 59, 59, 999); // Ensure end of day is UTC
        return { start, end };
      }
      case "lastMonth": {
        const start = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
        ); // Construct UTC date
        const end = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            0,
            23,
            59,
            59,
            999
          )
        ); // Construct UTC date
        return { start, end };
      }
      default:
        return null;
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filteredOrders = [...pendingOrders];

    // Search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter((order) =>
        order.number.toString().includes(lowerCaseSearchTerm)
      );
    }

    // Date preset filter
    if (datePreset === "custom") {
      // Custom date range
      if (customStartDate) {
        const start = new Date(
          Date.UTC(
            customStartDate.getFullYear(),
            customStartDate.getMonth(),
            customStartDate.getDate(),
            0,
            0,
            0
          )
        );
        filteredOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start;
        });
      }
      if (customEndDate) {
        const end = new Date(
          Date.UTC(
            customEndDate.getFullYear(),
            customEndDate.getMonth(),
            customEndDate.getDate(),
            23,
            59,
            59,
            999
          )
        );
        filteredOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate <= end;
        });
      }
    } else if (datePreset !== "all") {
      // Preset date range
      const dateRange = getDateRange(datePreset);
      if (dateRange) {
        filteredOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= dateRange.start && orderDate <= dateRange.end;
        });
      }
    }

    return filteredOrders.sort((a, b) => Number(a.number) - Number(b.number));
  }, [pendingOrders, searchTerm, datePreset, customStartDate, customEndDate]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, datePreset, customStartDate, customEndDate]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <OfficerAllOrdersPageSkeleton />
        </div>
      </div>
    );
  }

  const handleViewDetails = (order: Order) => {
    const index = filteredAndSortedOrders.findIndex((o) => o.id === order.id);
    setSelectedOrder(order);
    setCurrentOrderIndex(index); // Set the current order index
    setIsDetailModalOpen(true);
  };

  const handleNavigateOrder = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < filteredAndSortedOrders.length) {
      setSelectedOrder(filteredAndSortedOrders[newIndex]);
      setCurrentOrderIndex(newIndex);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const isFilterActive =
    searchTerm || datePreset !== "all" || customStartDate || customEndDate;

  return (
    <div className="min-h-screen bg-background pb-20">
      <OfficerNavbar handleLogout={handleLogout} />{" "}
      {/* Ensure OfficerNavbar is rendered */}
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header Section - Compact */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              คำสั่งซื้อรอจัดเตรียม
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  {filteredAndSortedOrders.length} รายการ
                  {isFilterActive && (
                    <span className="text-emerald-300"> (กรองแล้ว)</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter Bar */}
        <div className="mb-6 space-y-3">
          {/* Search and Date Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Main Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page directly when search term changes
                }}
                placeholder="ค้นหาด้วยเลขที่คำสั่งซื้อ..."
                className="w-full pl-12 pr-4 py-3.5 bg-background border-2 border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                maxLength={4}
              />
            </div>

            {/* Date Preset Dropdown */}
            <div className="relative sm:w-64">
              <Select
                value={datePreset}
                onValueChange={(value) => {
                  setDatePreset(value);
                  setCurrentPage(1); // Reset page directly when date preset changes
                }}
              >
                <SelectTrigger className="w-full pl-12 pr-4 py-3.5 bg-background border-2 border-border rounded-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all">
                  <Calendar className="absolute left-4 w-5 h-5 text-muted-foreground" />
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>ช่วงเวลา</SelectLabel>
                    {DATE_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {datePreset === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3 animate-in slide-in-from-top-2 duration-200">
              {/* Start Date */}
              <div className="relative flex-1">
                <DatePicker
                  date={customStartDate}
                  setDate={(date) => {
                    setCustomStartDate(date);
                    setCurrentPage(1); // Reset page directly when custom start date changes
                  }}
                  placeholder="จากวันที่"
                  className="w-full pl-12 sm:pl-20 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* End Date */}
              <div className="relative flex-1">
                <DatePicker
                  date={customEndDate}
                  setDate={(date) => {
                    setCustomEndDate(date);
                    setCurrentPage(1); // Reset page directly when custom end date changes
                  }}
                  placeholder="ถึงวันที่"
                  className="w-full pl-12 sm:pl-20 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Active Filters Chips */}
          {isFilterActive && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">ตัวกรองที่ใช้:</span>
              </div>

              {searchTerm && (
                <div className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
                  <Search className="w-3.5 h-3.5" />
                  <span>"{searchTerm}"</span>
                </div>
              )}

              {datePreset !== "all" && datePreset !== "custom" && (
                <div className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {DATE_PRESETS.find((p) => p.value === datePreset)?.label}
                  </span>
                </div>
              )}

              {datePreset === "custom" && customStartDate && (
                <div className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    ตั้งแต่: {format(customStartDate, "PPP", { locale: th })}
                  </span>
                </div>
              )}

              {datePreset === "custom" && customEndDate && (
                <div className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    ถึง: {format(customEndDate, "PPP", { locale: th })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Orders Table/Empty State */}
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          {filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center shadow-inner">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {searchTerm ||
                datePreset !== "all" ||
                customStartDate ||
                customEndDate
                  ? "ไม่พบคำสั่งซื้อที่ตรงกัน"
                  : "ยังไม่มีคำสั่งซื้อ"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm ||
                datePreset !== "all" ||
                customStartDate ||
                customEndDate
                  ? "ลองค้นหาด้วยคำค้นอื่น หรือเปลี่ยนช่วงเวลา"
                  : "ยังไม่มีคำสั่งซื้อที่รอจัดเตรียมในขณะนี้"}
              </p>
            </div>
          ) : (
            <OfficerAllOrdersTable
              orders={paginatedOrders}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>

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
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
                    finalPageNumbers[finalPageNumbers.length - 1] !== totalPages
                  ) {
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
      </div>
      {/* Modals - Add OrderDetailModal */}
      {isDetailModalOpen && selectedOrder && (
        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          order={selectedOrder}
          orderList={filteredAndSortedOrders} // Pass the list of filtered orders
          currentOrderIndex={currentOrderIndex} // Pass the current order's index
          onNavigate={handleNavigateOrder} // Pass the navigation handler
        />
      )}
    </div>
  );
}

export default OfficerAllOrdersPage;

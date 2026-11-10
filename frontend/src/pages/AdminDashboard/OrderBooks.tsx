import React, { useState, useEffect } from "react";
import { PlusCircle, Book, Search, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showToastSuccess, showToastError, showConfirmDialog } from "@/utils/alerts";
import type { OrderBook } from "@/types/orderBook";
import {
  getOrderBooks,
  createOrderBook,
  updateOrderBook,
  deleteOrderBook,
  bulkCloseOrderBooks,
  bulkOpenOrderBooks,
} from "@/utils/api/orderBooks";
import { finalizeClassroom, unfinalizeClassroom } from "@/utils/api/data";
import OrderBookTable, { isBookUnbooked } from "@/components/orderBooks/OrderBookTable";
import OrderBookFormModal from "@/components/orderBooks/OrderBookFormModal";
import OrderBookDeleteConfirmModal from "@/components/orderBooks/OrderBookDeleteConfirmModal";
import OrderBooksSkeleton from "@/components/dashboard/skeletons/OrderBooksSkeleton";

const OrderBooks: React.FC = () => {
  const [orderBooks, setOrderBooks] = useState<OrderBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedOrderBook, setSelectedOrderBook] = useState<OrderBook | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
    setSelectedBookIds([]);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setSelectedBookIds([]);
  }, [currentPage]);

  const fetchOrderBooks = async () => {
    setLoading(true);
    try {
      const response = await getOrderBooks(currentPage, itemsPerPage, debouncedSearchTerm);
      setOrderBooks(response.data);
      setTotalPages(response.meta_data.totalPages);
    } catch (err) {
      console.error("Error fetching order books:", err);
      setError("Failed to load order books.");
      showToastError({ title: "Error", text: "Failed to load order books." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderBooks();
  }, [currentPage, debouncedSearchTerm]);

  const handleAddOrderBookClick = () => {
    setSelectedOrderBook(null);
    setIsFormModalOpen(true);
  };

  const handleEditOrderBook = (orderBook: OrderBook) => {
    setSelectedOrderBook(orderBook);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (orderBook: OrderBook) => {
    if (orderBook.classroom?.isOrderFinalized) {
      showToastError({
        title: "ไม่สามารถลบได้",
        text: `สมุดจองเล่มที่ ${orderBook.bookNumber} สรุปยอดเค้กเรียบร้อยแล้ว ไม่สามารถลบได้`,
      });
      return;
    }
    setSelectedOrderBook(orderBook);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSaveOrderBook = async (data: any) => {
    try {
      if (selectedOrderBook) {
        await updateOrderBook(selectedOrderBook.id, data);
        showToastSuccess({ title: "Success", text: "อัพเดทสมุดจองสำเร็จ!" });
      } else {
        await createOrderBook(data);
        showToastSuccess({ title: "Success", text: "สร้างสมุดจองสำเร็จ!" });
      }
      fetchOrderBooks();
      setIsFormModalOpen(false);
      return true;
    } catch (err) {
      console.error("Error saving order book:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการบันทึก" });
      return false;
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteOrderBook(id);
      showToastSuccess({ title: "Success", text: "ลบสมุดจองสำเร็จ!" });
      fetchOrderBooks();
      setIsDeleteConfirmModalOpen(false);
      setSelectedOrderBook(null);
    } catch (err: any) {
      console.error("Error deleting order book:", err);
      const errorMessage =
        err?.response?.data || "เกิดข้อผิดพลาดในการลบสมุดจอง";
      showToastError({ title: "Error", text: errorMessage });
    }
  };

  const handleUnassign = async (orderBook: OrderBook) => {
    if (orderBook.classroom?.isOrderFinalized) {
      showToastError({
        title: "ไม่สามารถยกเลิกเจ้าของได้",
        text: `สมุดจองเล่มที่ ${orderBook.bookNumber} สรุปยอดเค้กเรียบร้อยแล้ว ไม่สามารถยกเลิกเจ้าของได้`,
      });
      return;
    }

    const confirmed = await showConfirmDialog({
      title: "ยืนยันการยกเลิกเจ้าของ",
      text: `คุณต้องการยกเลิกเจ้าของสำหรับสมุดจองเล่มที่ ${orderBook.bookNumber} ใช่หรือไม่?`,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed) return;

    try {
      // Use updateOrderBook directly which calls PATCH /order-books/:id
      // We send null to classroom_id to unassign.
      // Ensure backend UpdateOrderBookDto allows nullable classroom_id.
      await updateOrderBook(orderBook.id, { classroom_id: null } as any);
      showToastSuccess({ title: "Success", text: "ยกเลิกเจ้าของเรียบร้อยแล้ว!" });
      fetchOrderBooks();
    } catch (err: any) {
      console.error("Error unassigning order book:", err);
      const errorMessage =
        err?.response?.data || "ไม่สามารถยกเลิกเจ้าของได้";
      showToastError({ title: "Error", text: errorMessage });
    }
  };

  const handleToggleFinalize = async (orderBook: OrderBook) => {
    if (!orderBook.classroom_id) {
      showToastError({ title: "ข้อผิดพลาด", text: "สมุดจองเล่มนี้ยังไม่มีเจ้าของห้องเรียน" });
      return;
    }

    const isCurrentlyFinalized = Boolean(orderBook.classroom?.isOrderFinalized);
    const roomName = orderBook.classroom?.name
      ? `ห้อง ${orderBook.classroom.name}`
      : "ห้องเรียน";

    const confirmed = await showConfirmDialog({
      title: isCurrentlyFinalized ? "ยืนยันการปลดล็อกสรุปยอด" : "ยืนยันการสรุปยอด",
      text: isCurrentlyFinalized
        ? `คุณต้องการปลดล็อกการสรุปยอดสำหรับสมุดจองเล่มที่ ${orderBook.bookNumber} (${roomName}) ใช่หรือไม่? เมื่อปลดล็อกแล้วห้องเรียนจะสามารถเพิ่มและแก้ไขรายการออเดอร์ได้อีกครั้ง`
        : `คุณต้องการสรุปยอดสำหรับสมุดจองเล่มที่ ${orderBook.bookNumber} (${roomName}) ใช่หรือไม่? เมื่อสรุปยอดแล้วออเดอร์ในเล่มนี้จะไม่สามารถลบได้`,
      confirmButtonText: isCurrentlyFinalized ? "ยืนยันปลดล็อก" : "ยืนยันสรุปยอด",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed) return;

    try {
      if (isCurrentlyFinalized) {
        await unfinalizeClassroom(orderBook.classroom_id);
      } else {
        await finalizeClassroom(orderBook.classroom_id);
      }
      showToastSuccess({
        title: "สำเร็จ",
        text: isCurrentlyFinalized
          ? "ปลดล็อกสรุปยอดเรียบร้อยแล้ว"
          : "สรุปยอดเรียบร้อยแล้ว",
      });
      fetchOrderBooks();
    } catch (err) {
      console.error("Error toggling finalize status:", err);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถปรับสถานะการสรุปยอดได้",
      });
    }
  };

  const handleBulkCreate = async () => {
    const confirmed = await showConfirmDialog({
      title: "ยืนยันการสร้างสมุดจอง",
      text: "คุณต้องการสร้างสมุดจองเล่มที่ 001 - 100 โดยอัตโนมัติหรือไม่? (แต่ละเล่มมีความจุ 50 เลขที่)",
      confirmButtonText: "สร้างเลย",
      cancelButtonText: "ยกเลิก"
    });
    
    if (!confirmed) return;

    setLoading(true);
    try {
      let createdCount = 0;
      for (let i = 1; i <= 100; i++) {
        const bookNumber = i.toString().padStart(3, '0');
        const start = (i - 1) * 50 + 1;
        const end = i * 50;
        
        const data = {
          bookNumber,
          startNumber: start.toString().padStart(4, '0'),
          endNumber: end.toString().padStart(4, '0'),
          maxCapacity: 50,
        };

        try {
          await createOrderBook(data);
          createdCount++;
        } catch (err) {
          console.error(`Failed to create book ${bookNumber}:`, err);
          // Continue to next book even if one fails (e.g. if it already exists)
        }
      }
      
      showToastSuccess({ 
        title: "สร้างสำเร็จ", 
        text: `สร้างสมุดจองใหม่สำเร็จ ${createdCount} เล่ม` 
      });
      fetchOrderBooks();
    } catch (err) {
      console.error("Error during bulk create:", err);
      showToastError({ title: "เกิดข้อผิดพลาด", text: "ไม่สามารถสร้างสมุดจองแบบกลุ่มได้" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const eligibleIds = orderBooks.filter(isBookUnbooked).map((b) => b.id);
    const allSelected = eligibleIds.length > 0 && eligibleIds.every((id) => selectedBookIds.includes(id));
    if (allSelected) {
      setSelectedBookIds((prev) => prev.filter((id) => !eligibleIds.includes(id)));
    } else {
      setSelectedBookIds((prev) => Array.from(new Set([...prev, ...eligibleIds])));
    }
  };

  const handleBulkCloseSelected = async () => {
    if (selectedBookIds.length === 0) return;

    const confirmed = await showConfirmDialog({
      title: "ยืนยันการปิดสมุดจอง",
      text: `คุณต้องการปิดสมุดจองที่ไม่มีการจองที่เลือกจำนวน ${selectedBookIds.length} เล่ม ใช่หรือไม่? เมื่อปิดแล้วสมุดเล่มนี้จะไม่สามารถนำไปเปิดสั่งจองได้อีก`,
      confirmButtonText: "ยืนยันปิดเล่ม",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await bulkCloseOrderBooks({ ids: selectedBookIds });
      showToastSuccess({
        title: "สำเร็จ",
        text: `ปิดสมุดจองเรียบร้อยแล้วจำนวน ${res.count} เล่ม`,
      });
      setSelectedBookIds([]);
      fetchOrderBooks();
    } catch (err) {
      console.error("Error bulk closing order books:", err);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถปิดสมุดจองที่เลือกได้",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOpenSelected = async () => {
    if (selectedBookIds.length === 0) return;

    const confirmed = await showConfirmDialog({
      title: "ยืนยันการเปิดสมุดจอง",
      text: `คุณต้องการเปิดสมุดจองที่ไม่มีการจองที่เลือกจำนวน ${selectedBookIds.length} เล่ม ใช่หรือไม่? เมื่อเปิดแล้วสมุดเล่มนี้จะสามารถนำไปใช้สั่งจองได้ตามปกติ`,
      confirmButtonText: "ยืนยันเปิดเล่ม",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await bulkOpenOrderBooks({ ids: selectedBookIds });
      showToastSuccess({
        title: "สำเร็จ",
        text: `เปิดสมุดจองเรียบร้อยแล้วจำนวน ${res.count} เล่ม`,
      });
      setSelectedBookIds([]);
      fetchOrderBooks();
    } catch (err) {
      console.error("Error bulk opening order books:", err);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเปิดสมุดจองที่เลือกได้",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAllUnbookedInSystem = async () => {
    const confirmed = await showConfirmDialog({
      title: "ยืนยันการปิดสมุดจองที่ไม่มีการจองทั้งหมด",
      text: "คุณต้องการปิดสมุดจองทั้งหมดในระบบที่ยังไม่มีการจองเลยใช่หรือไม่? ระบบจะทำการปิดเฉพาะเล่มที่ยังไม่ถูกปิดและไม่มีรายการจองเท่านั้น",
      confirmButtonText: "ยืนยันปิดทั้งหมด",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await bulkCloseOrderBooks({ closeAllUnbooked: true });
      showToastSuccess({
        title: "สำเร็จ",
        text: `ปิดสมุดจองที่ไม่มีการจองทั้งหมดเรียบร้อยแล้ว (${res.count} เล่ม)`,
      });
      setSelectedBookIds([]);
      fetchOrderBooks();
    } catch (err) {
      console.error("Error closing all unbooked order books:", err);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถปิดสมุดจองได้",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllUnbookedInSystem = async () => {
    const confirmed = await showConfirmDialog({
      title: "ยืนยันการเปิดสมุดจองที่ไม่มีการจองทั้งหมด",
      text: "คุณต้องการเปิดสมุดจองทั้งหมดในระบบที่ยังไม่มีการจองเลยใช่หรือไม่? ระบบจะทำการเปิดเฉพาะเล่มที่ปิดอยู่และไม่มีรายการจองเท่านั้น",
      confirmButtonText: "ยืนยันเปิดทั้งหมด",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await bulkOpenOrderBooks({ openAllUnbooked: true });
      showToastSuccess({
        title: "สำเร็จ",
        text: `เปิดสมุดจองที่ไม่มีการจองทั้งหมดเรียบร้อยแล้ว (${res.count} เล่ม)`,
      });
      setSelectedBookIds([]);
      fetchOrderBooks();
    } catch (err) {
      console.error("Error opening all unbooked order books:", err);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเปิดสมุดจองได้",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && orderBooks.length === 0) {
    return <OrderBooksSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-xl shadow-md p-6 sm:p-8 mb-6 text-white">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-1.5 flex items-center gap-3">
              <Book className="w-9 h-9 text-white drop-shadow-sm" />
              จัดการสมุดจอง
            </h1>
            <p className="text-pink-100 text-sm sm:text-base">รายการสมุดจองทั้งหมดในระบบ</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              <Input
                placeholder="ค้นหาเลขเล่ม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/95 dark:bg-slate-900/90 text-gray-900 dark:text-slate-100 placeholder:text-muted-foreground border-0 shadow-inner rounded-lg w-full sm:w-56 focus:ring-2 focus:ring-white h-10"
              />
            </div>

            {/* Bulk Actions Dropdown Menu - High Contrast Solid White */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-10 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 hover:bg-pink-50 dark:hover:bg-slate-800 hover:text-pink-600 transition-all duration-150 flex items-center gap-2 rounded-lg text-xs sm:text-sm font-bold shadow-md border-0"
                >
                  <SlidersHorizontal className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>ตัวเลือกเพิ่มเติม</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 shadow-xl border-border bg-card">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                  จัดการสมุดจองทั้งระบบ
                </DropdownMenuLabel>
                
                <DropdownMenuItem
                  onClick={handleOpenAllUnbookedInSystem}
                  className="flex items-start gap-3 p-2.5 rounded-md cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
                >
                  <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">เปิดเล่มที่ยังไม่จองทั้งหมด</span>
                    <span className="text-xs text-muted-foreground">เปิดรับจองสำหรับสมุดที่ยังไม่มีรายการจอง</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleCloseAllUnbookedInSystem}
                  className="flex items-start gap-3 p-2.5 rounded-md cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                >
                  <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">ปิดเล่มที่ยังไม่จองทั้งหมด</span>
                    <span className="text-xs text-muted-foreground">ปิดรับจองเฉพาะสมุดที่ไม่มีรายการจอง</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem
                  onClick={handleBulkCreate}
                  className="flex items-start gap-3 p-2.5 rounded-md cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950/40 focus:bg-pink-50 dark:focus:bg-pink-950/40"
                >
                  <div className="p-1.5 rounded-md bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">สร้างเล่ม 001-100 อัตโนมัติ</span>
                    <span className="text-xs text-muted-foreground">สร้างชุดสมุดจองเริ่มต้นอัตโนมัติ</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={handleAddOrderBookClick}
              className="bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 active:scale-95 transition-all duration-150 flex items-center font-semibold shadow-md h-10 rounded-lg text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              เพิ่มสมุดจองใหม่
            </Button>
          </div>
        </div>
      </div>

      {selectedBookIds.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md p-3 px-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200">
            <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              เลือกสมุดจองที่ไม่มีการจอง <strong>{selectedBookIds.length}</strong> เล่ม
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBookIds([])}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ยกเลิกการเลือก
            </Button>
            <Button
              size="sm"
              onClick={handleBulkOpenSelected}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-sm text-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              เปิดเล่มที่เลือก ({selectedBookIds.length} เล่ม)
            </Button>
            <Button
              size="sm"
              onClick={handleBulkCloseSelected}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1.5 shadow-sm text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              ปิดเล่มที่เลือก ({selectedBookIds.length} เล่ม)
            </Button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="opacity-50 pointer-events-none">
           <OrderBookTable
            orderBooks={orderBooks}
            selectedBookIds={selectedBookIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleEditOrderBook}
            onDelete={handleDeleteClick}
            onUnassign={handleUnassign}
            onToggleFinalize={handleToggleFinalize}
          />
        </div>
      ) : (
        <OrderBookTable
          orderBooks={orderBooks}
          selectedBookIds={selectedBookIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEdit={handleEditOrderBook}
          onDelete={handleDeleteClick}
          onUnassign={handleUnassign}
          onToggleFinalize={handleToggleFinalize}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            ก่อนหน้า
          </Button>
          <div className="text-sm text-muted-foreground">
            หน้า {currentPage} จาก {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            ถัดไป
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      <OrderBookFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveOrderBook}
        currentOrderBook={selectedOrderBook || undefined}
      />

      <OrderBookDeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        orderBookToDelete={selectedOrderBook}
      />
    </div>
  );
};

export default OrderBooks;

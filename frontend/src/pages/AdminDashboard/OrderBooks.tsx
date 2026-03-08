import React, { useState, useEffect } from "react";
import { PlusCircle, Book, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToastSuccess, showToastError, showConfirmDialog } from "@/utils/alerts";
import type { OrderBook } from "@/types/orderBook";
import {
  getOrderBooks,
  createOrderBook,
  updateOrderBook,
  deleteOrderBook,
} from "@/utils/api/orderBooks";
import OrderBookTable from "@/components/orderBooks/OrderBookTable";
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
  }, [debouncedSearchTerm]);

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
    } catch (err) {
      console.error("Error deleting order book:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการลบสมุดจอง" });
    }
  };

  const handleUnassign = async (orderBook: OrderBook) => {
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
    } catch (err) {
      console.error("Error unassigning order book:", err);
      showToastError({ title: "Error", text: "ไม่สามารถยกเลิกเจ้าของได้" });
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

  if (loading && orderBooks.length === 0) {
    return <OrderBooksSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Book className="w-10 h-10 mr-4 text-white" />
              จัดการสมุดจอง
            </h1>
            <p className="text-white text-lg">รายการสมุดจองทั้งหมด</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              <Input
                placeholder="ค้นหาเลขเล่ม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 text-gray-900 border-none rounded-md w-full sm:w-64 focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkCreate}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-pink-600 transition-colors duration-200"
              >
                สร้างเล่ม 001-100 อัตโนมัติ
              </Button>
              <Button
                onClick={handleAddOrderBookClick}
                className="bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 transition-colors duration-200 flex items-center shadow-sm"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                เพิ่มสมุดจองใหม่
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="opacity-50 pointer-events-none">
           <OrderBookTable
            orderBooks={orderBooks}
            onEdit={handleEditOrderBook}
            onDelete={handleDeleteClick}
            onUnassign={handleUnassign}
          />
        </div>
      ) : (
        <OrderBookTable
          orderBooks={orderBooks}
          onEdit={handleEditOrderBook}
          onDelete={handleDeleteClick}
          onUnassign={handleUnassign}
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

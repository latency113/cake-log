import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types"; // Import Order type

interface OrderDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>; // Change to match calling component and type
  order: (Order & { departmentName?: string }) | null; // Change name to 'order'
}

const OrderDeleteConfirmModal: React.FC<OrderDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete, // Renamed
  order, // Renamed
}) => {
  const handleDelete = () => {
    if (order) { // Use 'order'
      onConfirmDelete(); // Call directly as it returns Promise<void>
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            คุณต้องการลบคำสั่งซื้อเล่มที่{" "}
            <span className="font-semibold underline">
              {order?.book?.bookNumber || order?.book_id}
            </span>{" "}
            เลขที่{" "}
            <span className="font-semibold underline">
              {order?.number}
            </span>{" "}
            ของลูกค้า{" "}
            <span className="font-semibold underline">
              {order?.customerName}
            </span>{" "}
            ใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" className="hover:bg-red-700" onClick={handleDelete}>
            <span className="text-white">
              ลบ
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDeleteConfirmModal;

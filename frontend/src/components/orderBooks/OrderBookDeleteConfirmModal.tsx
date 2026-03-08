import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OrderBook } from "@/types/orderBook";

interface OrderBookDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  orderBookToDelete: OrderBook | null;
}

const OrderBookDeleteConfirmModal: React.FC<OrderBookDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderBookToDelete,
}) => {
  const handleConfirm = async () => {
    if (orderBookToDelete) {
      await onConfirm(orderBookToDelete.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
          <AlertDialogDescription>
            การกระทำนี้ไม่สามารถย้อนกลับได้ คุณกำลังจะลบสมุดจองเล่มที่{" "}
            <span className="font-bold">{orderBookToDelete?.bookNumber}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            ลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderBookDeleteConfirmModal;

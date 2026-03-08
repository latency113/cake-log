import React from "react";
import type { Order } from "../../types";
import OrderForm from "../form/OrderForm";
import { X } from "lucide-react";

interface OrderEditModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderEdited: () => void; // New prop: Callback after successful edit
  isOpen: boolean; // Add isOpen prop
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, onClose, onOrderEdited }) => {
  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      {/* Main Modal Content */}
      <div className="relative w-full max-w-8xl h-[90vh] rounded-lg overflow-hidden bg-white dark:bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-foreground">
              แก้ไขคำสั่งซื้อ
            </h2>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">
              เล่มที่ {order?.book?.bookNumber || order?.book_id} เลขที่ {order?.number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto p-4 ">
          <OrderForm initialOrder={order} onOrderEdited={onOrderEdited} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default OrderEditModal;

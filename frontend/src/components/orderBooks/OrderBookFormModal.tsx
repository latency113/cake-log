import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { OrderBook, CreateOrderBookDto, UpdateOrderBookDto } from "@/types/orderBook";

interface OrderBookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateOrderBookDto | UpdateOrderBookDto) => Promise<boolean>;
  currentOrderBook?: OrderBook;
}

const OrderBookFormModal: React.FC<OrderBookFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentOrderBook,
}) => {
  const [formData, setFormData] = useState<Partial<OrderBook>>({
    bookNumber: "",
    startNumber: "1",
    endNumber: "50",
    maxCapacity: 50,
    isClosed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentOrderBook) {
      setFormData({
        bookNumber: currentOrderBook.bookNumber,
        startNumber: currentOrderBook.startNumber,
        endNumber: currentOrderBook.endNumber,
        maxCapacity: currentOrderBook.maxCapacity,
        isClosed: currentOrderBook.isClosed,
      });
    } else {
      setFormData({
        bookNumber: "",
        startNumber: "1",
        endNumber: "50",
        maxCapacity: 50,
        isClosed: false,
      });
    }
  }, [currentOrderBook, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxCapacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isClosed: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await onSave(formData as CreateOrderBookDto | UpdateOrderBookDto);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentOrderBook ? "แก้ไขสมุดจอง" : "เพิ่มสมุดจองใหม่"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bookNumber" className="text-right">
              เลขเล่ม
            </Label>
            <Input
              id="bookNumber"
              name="bookNumber"
              value={formData.bookNumber}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startNumber" className="text-right">
              เลขเริ่มต้น
            </Label>
            <Input
              id="startNumber"
              name="startNumber"
              value={formData.startNumber}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endNumber" className="text-right">
              เลขสิ้นสุด
            </Label>
            <Input
              id="endNumber"
              name="endNumber"
              value={formData.endNumber}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxCapacity" className="text-right">
              ความจุสูงสุด
            </Label>
            <Input
              id="maxCapacity"
              name="maxCapacity"
              type="number"
              value={formData.maxCapacity}
              onChange={handleChange}
              className="col-span-3"
              required
              readOnly // Optional: make read-only if strictly calculated
            />
          </div>
          {currentOrderBook && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isClosed" className="text-right">
                ปิดเล่ม
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isClosed"
                  checked={formData.isClosed}
                  onCheckedChange={handleCheckboxChange}
                />
                <label
                  htmlFor="isClosed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {formData.isClosed ? "ปิดแล้ว" : "เปิดอยู่"}
                </label>
              </div>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderBookFormModal;

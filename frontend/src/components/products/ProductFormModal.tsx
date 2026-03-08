import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import InputField from "@/components/common/InputField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types";
import type { InputChangeEvent } from "@/types/common";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => Promise<boolean>;
  currentProduct?: Product;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProduct,
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: "",
    price: 0,
    createdAt: "",
    updatedAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentProduct) {
        setFormData({ name: currentProduct.name, price: currentProduct.price, createdAt: currentProduct.createdAt, updatedAt: currentProduct.updatedAt });
      } else {
        setFormData({ name: "", price: 0, createdAt: "", updatedAt: "" });
      }
      setIsSubmitting(false);
    }
  }, [currentProduct, isOpen]);

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  const isFormValid = () => {
    return formData.name.trim() !== "" && formData.price > 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {currentProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <InputField
            id="name"
            name="name"
            label="ชื่อสินค้า *"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full"
          />
          <InputField
            id="price"
            name="price"
            label="ราคาต่อปอนด์ *"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            min={0}
            className="w-full"
          />

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : currentProduct ? (
                "บันทึกการเปลี่ยนแปลง"
              ) : (
                "เพิ่มสินค้า"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;

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
import type { Department } from "@/types/department";
import type { InputChangeEvent } from "@/types/common";

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Omit<Department, 'id'> | Department) => Promise<boolean>;
  currentDepartment?: Department;
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentDepartment,
}) => {
  const [formData, setFormData] = useState<Omit<Department, 'id'>>({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentDepartment) {
        setFormData({ name: currentDepartment.name });
      } else {
        setFormData({ name: "" });
      }
      setIsSubmitting(false);
    }
  }, [currentDepartment, isOpen]);

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    return formData.name.trim() !== "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {currentDepartment ? "แก้ไขแผนก" : "เพิ่มแผนกใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <InputField
            id="name"
            name="name"
            label="ชื่อแผนก *"
            value={formData.name}
            onChange={handleChange}
            required
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
              ) : currentDepartment ? (
                "บันทึกการเปลี่ยนแปลง"
              ) : (
                "เพิ่มแผนก"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentFormModal;

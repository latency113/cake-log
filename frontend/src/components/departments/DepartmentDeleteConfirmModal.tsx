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
import type { Department } from "@/types/department";

interface DepartmentDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  departmentToDelete: Department | null;
}

const DepartmentDeleteConfirmModal: React.FC<DepartmentDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  departmentToDelete,
}) => {
  const handleDelete = () => {
    if (departmentToDelete) {
      onConfirm(departmentToDelete.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            คุณต้องการลบแผนก {" "}
            <span className="font-semibold underline">
              {departmentToDelete?.name}
            </span>
             {" "}ใช่ไหม?
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

export default DepartmentDeleteConfirmModal;

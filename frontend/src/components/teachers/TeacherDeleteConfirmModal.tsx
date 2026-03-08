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
import type { Teacher } from "@/types/teacher";

interface TeacherDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  teacherToDelete: Teacher | null;
}

const TeacherDeleteConfirmModal: React.FC<TeacherDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  teacherToDelete,
}) => {
  const handleDelete = () => {
    if (teacherToDelete) {
      onConfirm(teacherToDelete.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            คุณต้องการลบครู {" "}
            <span className="font-semibold underline">
              {teacherToDelete?.name}
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

export default TeacherDeleteConfirmModal;

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
import type { Classroom } from "@/types/classroom";

interface ClassroomDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  classroomToDelete: Classroom | null;
}

const ClassroomDeleteConfirmModal: React.FC<ClassroomDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  classroomToDelete,
}) => {
  const handleDelete = () => {
    if (classroomToDelete) {
      onConfirm(classroomToDelete.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            คุณต้องการลบห้องเรียน {" "}
            <span className="font-semibold underline">
              {classroomToDelete?.name}
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

export default ClassroomDeleteConfirmModal;

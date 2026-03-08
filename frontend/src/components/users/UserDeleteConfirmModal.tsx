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
import type { User } from "@/types/user";

interface UserDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  userToDelete: User | null;
}

const UserDeleteConfirmModal: React.FC<UserDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userToDelete,
}) => {
  const handleDelete = () => {
    if (userToDelete) {
      onConfirm(userToDelete.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            คุณต้องการลบผู้ใช้ {" "}
            <span className="font-semibold underline">
              {userToDelete?.firstname} {userToDelete?.lastname}
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
              Delete
              </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDeleteConfirmModal;

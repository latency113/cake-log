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
import type { Team } from "@/types/team";

interface TeamDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  teamToDelete: Team | null;
}

const TeamDeleteConfirmModal: React.FC<TeamDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  teamToDelete,
}) => {
  const handleDelete = () => {
    if (teamToDelete) {
      onConfirm(teamToDelete.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            คุณต้องการลบทีม {" "}
            <span className="font-semibold underline">
              {teamToDelete?.name}
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

export default TeamDeleteConfirmModal;

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
import type { Teacher } from "@/types/teacher";
import type { Department } from "@/types/department";
import type { InputChangeEvent } from "@/types/common";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDepartments } from "@/utils/api/departments";

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Omit<Teacher, "id"> | Teacher) => Promise<boolean>;
  currentTeacher?: Teacher;
}

const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTeacher,
}) => {
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    name: "",
    department_id: "",
    createdAt: "",
    updatedAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentsData, setDepartmentsData] = useState<Department[]>([]);

  useEffect(() => {
            const fetchDepartments = async () => {
              try {
                const data = await getDepartments(1, 100); // Fetch first 100 departments
                setDepartmentsData(data.data);
                console.log("Fetched departments data:", data);
              } catch (error) {        console.error("Error fetching departments:", error);
      }
    };

    if (isOpen) {
      fetchDepartments();
      if (currentTeacher) {
        setFormData({ name: currentTeacher.name, department_id: currentTeacher.department_id, createdAt: currentTeacher.createdAt, updatedAt: currentTeacher.updatedAt });
      } else {
        setFormData({ name: "", department_id: "", createdAt: "", updatedAt: "" });
      }
      setIsSubmitting(false);
    }
  }, [currentTeacher, isOpen]);

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
            {currentTeacher ? "แก้ไขรายชื่อครู" : "เพิ่มรายชื่อครู"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <InputField
            id="name"
            name="name"
            label="ชื่อครู *"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full"
          />
          <Select
            value={formData.department_id}
            onValueChange={(value) =>
              handleSelectChange("department_id", value)
            }
          >
            <SelectTrigger id="department_id" className="w-full">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {departmentsData.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

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
              ) : currentTeacher ? (
                "บันทึกการเปลี่ยนแปลง"
              ) : (
                "เพิ่มครู"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherFormModal;

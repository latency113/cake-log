import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileSpreadsheet, X } from "lucide-react";

interface ClassroomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<boolean>; // รับแค่ไฟล์ส่งกลับไป
}

const ClassroomFormModal: React.FC<ClassroomFormModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // เมื่อปิด Modal ให้เคลียร์ไฟล์
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const success = await onConfirm(selectedFile);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            นำเข้าข้อมูลชั้นเรียน (Excel)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {/* คำแนะนำ */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">คำแนะนำ:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
              <li>ระบบจะสร้าง ห้อง, ครู, แผนก และ นักเรียน จากไฟล์ให้อัตโนมัติ</li>
              <li>ใช้ไฟล์รูปแบบรายงาน (Report Format) ตามที่กำหนด</li>
            </ul>
          </div>

          {/* พื้นที่อัปโหลดไฟล์ */}
          <div className="relative group">
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            
            {!selectedFile ? (
              <label
                htmlFor="excel-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  คลิกเพื่อเลือกไฟล์ Excel
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  รองรับไฟล์ .xlsx, .xls
                </span>
              </label>
            ) : (
              <div className="relative flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-green-200 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                "เริ่มนำเข้าข้อมูล"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassroomFormModal;
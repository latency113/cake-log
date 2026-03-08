import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import TeacherAutocomplete from "@/components/common/TeacherAutocomplete"; // Simpler version
import type { Classroom, Department, Teacher, GradeLevel } from "@/types";
import { getDepartments } from "@/utils/api/departments";
import { Loader2, FileSpreadsheet, Upload, X } from "lucide-react"; // Import FileSpreadsheet, Upload, X
import { getYears } from "@/utils/api/data";
import { getTeachers } from "@/utils/api/teachers"; // Import getTeachers to map names to IDs
import { showToastSuccess, showToastError } from "@/utils/alerts"; // Import toast notifications

interface ClassroomEditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classroom: Partial<Classroom>) => Promise<boolean>;
  onImportStudentsFile: (classroomId: string, file: File) => Promise<boolean>; // Renamed prop
  classroomToEdit?: Classroom | null;
}

const ClassroomEditFormModal: React.FC<ClassroomEditFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onImportStudentsFile, // Renamed prop
  classroomToEdit,
}) => {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacherNameInput, setTeacherNameInput] = useState(""); // Use for autocomplete input value
  const [departments, setDepartments] = useState<Department[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // Store all teachers for ID mapping
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for student file upload
  const [selectedStudentFile, setSelectedStudentFile] = useState<File | null>(null);
  const [isImportingStudents, setIsImportingStudents] = useState(false);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const teachersData = await getTeachers();
        setAllTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching all teachers:", error);
      }
    };
    fetchAllTeachers();
  }, []);

  useEffect(() => {
    // Populate form if editing
    if (classroomToEdit) {
      setName(classroomToEdit.name);
      setDepartmentId(classroomToEdit.department_id || "");
      setGradeLevelId(classroomToEdit.grade_level_id || "");
      setTeacherId(classroomToEdit.teacher_id || "");
      const currentTeacher = allTeachers.find(t => t.id === classroomToEdit.teacher_id);
      setTeacherNameInput(currentTeacher?.name || "");
    } else {
      // Clear form if adding new
      setName("");
      setDepartmentId("");
      setGradeLevelId("");
      setTeacherId("");
      setTeacherNameInput("");
    }
    setErrors({});
    setSelectedStudentFile(null); // Clear file on modal open/close
  }, [classroomToEdit, isOpen, allTeachers]); // Add allTeachers to dependency array

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [departmentsData, fetchedGradeLevels] = await Promise.all([
          getDepartments(1, 9999),
          getYears(),
        ]);
        setDepartments(departmentsData.data);
        setGradeLevels(fetchedGradeLevels);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        // Optionally show an error toast
      }
    };
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "ชื่อห้องเรียนห้ามว่าง";
    if (!departmentId) newErrors.departmentId = "กรุณาเลือกแผนก";
    if (!gradeLevelId) newErrors.gradeLevelId = "กรุณาเลือกระดับชั้น";
    if (!teacherId) newErrors.teacherId = "กรุณาเลือกครูที่ปรึกษา";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Before validating, try to find the teacherId based on teacherNameInput
    const selectedTeacherObj = allTeachers.find(
      (t) => t.name === teacherNameInput
    );
    if (selectedTeacherObj) {
      setTeacherId(selectedTeacherObj.id);
    } else {
      // If no matching teacher, clear teacherId to force validation error
      setTeacherId("");
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave({
        id: classroomToEdit?.id, // Only include ID if editing
        name,
        department_id: departmentId,
        grade_level_id: gradeLevelId,
        teacher_id: selectedTeacherObj?.id || teacherId, // Use selectedTeacherObj.id if found, otherwise existing teacherId
      });
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving classroom:", error);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการบันทึกข้อมูลห้องเรียน" });
      // Error handling is done in the parent component via onSave's return value
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherInputChange = (value: string) => {
    setTeacherNameInput(value);
    // When input changes, clear teacherId if it doesn't match an existing teacher
    const matchingTeacher = allTeachers.find((t) => t.name === value);
    setTeacherId(matchingTeacher?.id || "");
  };

  const handleTeacherInputBlur = () => {
    // On blur, if the input doesn't match a teacher, clear the input or try to select the closest match
    const matchingTeacher = allTeachers.find((t) => t.name === teacherNameInput);
    if (!matchingTeacher && teacherNameInput !== "") {
      setTeacherNameInput(""); // Clear if no match
      setTeacherId("");
    } else if (matchingTeacher) {
      setTeacherNameInput(matchingTeacher.name); // Ensure the input reflects the exact matched name
      setTeacherId(matchingTeacher.id);
    }
  };

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedStudentFile(file);
    }
  };

  const handleImportStudents = async () => {
    if (!selectedStudentFile || !classroomToEdit?.id) {
      showToastError({ title: "Error", text: "กรุณาเลือกไฟล์ Excel และห้องเรียนต้องถูกบันทึกแล้ว" });
      return;
    }

    setIsImportingStudents(true);
    try {
      const success = await onImportStudentsFile(classroomToEdit.id, selectedStudentFile); // Using renamed prop
      if (success) {
        setSelectedStudentFile(null);
        showToastSuccess({ title: "Success", text: "นำเข้ารายชื่อนักเรียนสำเร็จ!" });
        // The parent will handle refreshing after onSave success
      }
    } catch (error) {
      console.error("Error importing students:", error);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการนำเข้ารายชื่อนักเรียน" });
    } finally {
      setIsImportingStudents(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {classroomToEdit ? "แก้ไขห้องเรียน" : "เพิ่มห้องเรียนใหม่"}
          </DialogTitle>
          <DialogDescription>กรอกรายละเอียดสำหรับห้องเรียน</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <InputField
            id="name"
            label="ชื่อห้องเรียน"
            value={name}
            onChange={(e) => setName(e.target.value)}
            errorMessage={errors.name}
            disabled={isSubmitting}
          />
          <SelectField
            id="department"
            name="department"
            label="แผนก"
            value={departmentId}
            onChange={(newValue) => setDepartmentId(newValue)}
            options={departments.map((dept) => ({
              value: dept.id,
              label: dept.name,
            }))}
            placeholder="เลือกแผนก"
            error={errors.departmentId}
            disabled={isSubmitting}
          />
          <SelectField
            id="gradeLevel"
            name="gradeLevel"
            label="ระดับชั้น"
            value={gradeLevelId}
            onChange={(newValue) => setGradeLevelId(newValue)}
            options={gradeLevels.map((gl) => ({
              value: gl.id,
              label: `${
                gl.level === "VOCATIONAL"
                  ? "ปวช."
                  : gl.level === "HIGHER"
                  ? "ปวส."
                  : gl.level
              } ${gl.year}`,
            }))}
            placeholder="เลือกระดับชั้น"
            error={errors.gradeLevelId}
            disabled={isSubmitting}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ครูที่ปรึกษา
            </label>
            <TeacherAutocomplete
              value={teacherNameInput}
              onChange={handleTeacherInputChange}
              onBlur={handleTeacherInputBlur}
              options={allTeachers.map(teacher => ({ value: teacher.id, label: teacher.name }))}
              placeholder="ค้นหาครูที่ปรึกษา..."
              className="w-full"
            />
            {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
          </div>

          {/* Student List Upload Section (only for existing classrooms) */}
          {classroomToEdit && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                นำเข้ารายชื่อนักเรียน (Excel)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                อัพเดทรายชื่อนักเรียนสำหรับห้องเรียนนี้
              </p>
              
              <div className="relative group mb-4">
                <input
                  id="student-excel-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleStudentFileChange}
                  className="hidden"
                  disabled={isImportingStudents}
                />
                
                {!selectedStudentFile ? (
                  <label
                    htmlFor="student-excel-upload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="p-2 bg-blue-100 rounded-full mb-1 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      คลิกเพื่อเลือกไฟล์ Excel
                    </span>
                    <span className="text-xs text-gray-400 mt-0">
                      รองรับไฟล์ .xlsx, .xls
                    </span>
                  </label>
                ) : (
                  <div className="relative flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="p-1 bg-green-100 rounded-full mr-2">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedStudentFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedStudentFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentFile(null)}
                      className="p-1 hover:bg-green-200 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                      disabled={isImportingStudents}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleImportStudents}
                disabled={!selectedStudentFile || isImportingStudents}
                className="w-full"
              >
                {isImportingStudents ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังนำเข้า...
                  </>
                ) : (
                  "เริ่มนำเข้ารายชื่อนักเรียน"
                )}
              </Button>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isImportingStudents}>
            ยกเลิก
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || isImportingStudents}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึกข้อมูลห้องเรียน"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassroomEditFormModal;



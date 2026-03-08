import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import InputField from "@/components/common/InputField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  Loader2,
  Users,
  User,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import type { Team, Classroom, Department } from "@/types";
import type { CreateTeamDto, UpdateTeamDto } from "@/types/team";
import type { InputChangeEvent } from "@/types/common";

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: CreateTeamDto | UpdateTeamDto) => Promise<boolean>;
  currentTeam?: Team;
  classrooms: Classroom[];
  departments: Department[];
}

const TeamFormModal: React.FC<TeamFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTeam,
  classrooms,
  departments,
}) => {
  const [formData, setFormData] = useState<CreateTeamDto | UpdateTeamDto>({
    id:"",
    name: "",
    classroom_ids: [],
    team_type: "team",
    student_member_name: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    []
  );
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [availableStudentOptions, setAvailableStudentOptions] = useState<
    {
      value: string;
      label: string;
      classroomName: string;
      departmentName: string;
    }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      if (currentTeam) {
        const classroomIds = currentTeam.classroom_ids || [];
        setFormData({
          id: currentTeam.id, // Include the ID for updates
          name: currentTeam.name,
          classroom_ids: classroomIds,
          team_type: currentTeam.team_type,
          student_member_name: currentTeam.student_member_name || [],
        });
        const departmentsFromClassrooms = Array.from(
          new Set(
            classrooms
              .filter((cls) => classroomIds.includes(cls.id))
              .map((cls) => cls.department_id)
          )
        );
        setSelectedDepartmentIds(departmentsFromClassrooms);
      } else {
        setFormData({
          name: "",
          classroom_ids: [],
          team_type: "team",
          student_member_name: [],
        });
        setSelectedDepartmentIds([]);
      }
      setIsSubmitting(false);
    }
  }, [currentTeam, isOpen, classrooms]);

  useEffect(() => {
    if (selectedDepartmentIds.length > 0) {
      const departmentClassrooms = classrooms.filter((cls) =>
        selectedDepartmentIds.includes(cls.department_id)
      );
      setFilteredClassrooms(departmentClassrooms);
      const validClassroomIds = (formData.classroom_ids ?? []).filter((id) =>
        departmentClassrooms.some((cls) => cls.id === id)
      );
      if (validClassroomIds.length !== (formData.classroom_ids ?? []).length) {
        setFormData((prev) => ({ ...prev, classroom_ids: validClassroomIds }));
      }
    } else {
      setFilteredClassrooms([]);
      setFormData((prev) => ({ ...prev, classroom_ids: [] }));
    }
  }, [selectedDepartmentIds, classrooms]);

  useEffect(() => {
    const studentsFromSelectedClassrooms: {
      value: string;
      label: string;
      classroomName: string;
      departmentName: string;
    }[] = [];
    (formData.classroom_ids ?? []).forEach((classroomId) => {
      const classroom = classrooms.find((cls) => cls.id === classroomId);
      if (classroom && classroom.students && classroom.students.length > 0) {
        const department = departments.find(
          (d) => d.id === classroom.department_id
        );
        const departmentName = department ? department.name : "ไม่ระบุแผนก";
        classroom.students.forEach((student) => {
          studentsFromSelectedClassrooms.push({
            value: student.studentName,
            label: student.studentName,
            classroomName: classroom.name,
            departmentName: departmentName,
          });
        });
      }
    });
    const uniqueStudents = Array.from(
      new Map(
        studentsFromSelectedClassrooms.map((item) => [item.value, item])
      ).values()
    );
    setAvailableStudentOptions(uniqueStudents);

    if (
      formData.student_member_name &&
      formData.student_member_name.length > 0
    ) {
      const newStudentNames = formData.student_member_name.filter((name) =>
        uniqueStudents.some((s) => s.value === name)
      );
      if (newStudentNames.length !== formData.student_member_name.length) {
        setFormData((prev) => ({
          ...prev,
          student_member_name: newStudentNames,
        }));
      }
    }
  }, [formData.classroom_ids, classrooms, formData.student_member_name]);

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAllDepartments = () => {
    setSelectedDepartmentIds(departments.map((dept) => dept.id));
  };

  const handleClearAllDepartments = () => {
    setSelectedDepartmentIds([]);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartmentIds((prev) => {
      if (prev.includes(departmentId)) {
        return prev.filter((id) => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  const handleClassroomToggle = (classroomId: string) => {
    setFormData((prev) => {
      const currentIds = prev.classroom_ids ?? [];
      if (currentIds.includes(classroomId)) {
        return {
          ...prev,
          classroom_ids: currentIds.filter((id) => id !== classroomId),
        };
      } else {
        return { ...prev, classroom_ids: [...currentIds, classroomId] };
      }
    });
  };

  const handleTeamTypeChange = (value: "team" | "person") => {
    setFormData((prev) => ({
      ...prev,
      team_type: value,
      student_member_name: [],
    }));
  };

  const handleStudentToggle = (studentName: string) => {
    setFormData((prev) => {
      const currentStudents = (prev.student_member_name || []) as string[];
      if (currentStudents.includes(studentName)) {
        return {
          ...prev,
          student_member_name: currentStudents.filter(
            (name) => name !== studentName
          ),
        };
      } else {
        return {
          ...prev,
          student_member_name: [...currentStudents, studentName],
        };
      }
    });
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
    const baseValid =
      (formData.name ?? "").trim() !== "" &&
      (formData.classroom_ids ?? []).length > 0 &&
      selectedDepartmentIds.length > 0;

    if (!baseValid) {
      return false;
    }

    if (formData.team_type === "person") {
      return (formData.student_member_name as string[]).length === 1;
    } else if (formData.team_type === "team") {
      if ((formData.student_member_name as string[]).length === 0) {
        return false;
      }

      // New validation: If multiple departments are selected, students must be from at least two different departments
      if (selectedDepartmentIds.length > 1) {
        const selectedStudentDepartmentIds = new Set<string>();
        (formData.student_member_name ?? []).forEach((studentName) => {
          const studentOption = availableStudentOptions.find(
            (s) => s.value === studentName
          );
          if (studentOption) {
            const department = departments.find(
              (d) => d.name === studentOption.departmentName
            );
            if (department) {
              selectedStudentDepartmentIds.add(department.id);
            }
          }
        });
        return selectedStudentDepartmentIds.size > 1;
      }
      return true;
    }
    return false; // Should not reach here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background text-foreground max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {currentTeam ? (
              <>
                <Users className="h-6 w-6" />
                แก้ไขทีม
              </>
            ) : (
              <>
                <Users className="h-6 w-6" />
                เพิ่มทีมใหม่
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Team Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Users className="h-4 w-4 text-primary" />
                ชื่อทีม <span className="text-destructive">*</span>
              </label>
              <InputField
                id="name"
                name="name"
                value={formData.name ?? ""}
                onChange={handleChange}
                required
                className="w-full h-10"
                placeholder="กรอกชื่อทีม"
              />
            </div>

            {/* Team Type */}
            <div className="space-y-2">
              <label
                htmlFor="team_type"
                className="text-sm font-medium leading-none flex items-center gap-2"
              >
                <Users className="h-4 w-4 text-primary" />
                ประเภททีม <span className="text-destructive">*</span>
              </label>
              <Select
                onValueChange={handleTeamTypeChange}
                value={formData.team_type ?? "team"}
                required
              >
                <SelectTrigger id="team_type" className="w-full h-10">
                  <SelectValue placeholder="เลือกประเภททีม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      ทีม (เลือกได้หลายคน)
                    </div>
                  </SelectItem>
                  <SelectItem value="person">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      บุคคล (เลือกได้ 1 คน)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.team_type === "person" && (
                <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-500"></span>
                  สามารถเลือกสมาชิกได้เพียง 1 คนเท่านั้น
                </p>
              )}
            </div>

            {/* Department Multi-Select */}
            <div className="space-y-2">
              <label
                htmlFor="department"
                className="text-sm font-medium leading-none flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  แผนก <span className="text-destructive">*</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {(selectedDepartmentIds ?? []).length} เลือกแล้ว
                </span>
              </label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-10 justify-between hover:bg-accent/50 transition-colors"
                  >
                    <span className="truncate">
                      {selectedDepartmentIds.length === 0
                        ? "เลือกแผนก"
                        : selectedDepartmentIds.length === departments.length
                        ? "ทั้งหมด"
                        : departments
                            .filter((dept) =>
                              selectedDepartmentIds.includes(dept.id)
                            )
                            .map((dept) => dept.name)
                            .slice(0, 2)
                            .join(", ") +
                          (selectedDepartmentIds.length > 2
                            ? ` +${selectedDepartmentIds.length - 2}`
                            : "")}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <div className="flex gap-2 p-2 border-b bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={handleSelectAllDepartments}
                      className="flex-1 h-8 text-xs"
                    >
                      เลือกทั้งหมด
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={handleClearAllDepartments}
                      className="flex-1 h-8 text-xs"
                    >
                      ล้างทั้งหมด
                    </Button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        onClick={() => handleDepartmentToggle(dept.id)}
                        className="flex items-center space-x-2.5 px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          id={`department-${dept.id}`}
                          checked={selectedDepartmentIds.includes(dept.id)}
                        />
                        <label
                          htmlFor={`department-${dept.id}`}
                          className="text-sm flex-grow cursor-pointer"
                        >
                          {dept.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Classroom Multi-Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                ห้องเรียน <span className="text-destructive">*</span>
              </span>
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {(formData.classroom_ids ?? []).length} เลือกแล้ว
              </span>
            </label>
            <div className="border-2 border-dashed rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
              {selectedDepartmentIds.length === 0 ||
              filteredClassrooms.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {selectedDepartmentIds.length === 0
                      ? "กรุณาเลือกแผนกก่อน"
                      : "ไม่มีห้องเรียนในแผนกนี้"}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto p-3 space-y-1.5">
                  {filteredClassrooms.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center space-x-3 hover:bg-accent/60 p-3 rounded-lg transition-all border border-transparent hover:border-border/50 hover:shadow-sm"
                    >
                      <Checkbox
                        id={`classroom-${cls.id}`}
                        checked={(formData.classroom_ids ?? []).includes(
                          cls.id
                        )}
                        onCheckedChange={() => handleClassroomToggle(cls.id)}
                      />
                      <label
                        htmlFor={`classroom-${cls.id}`}
                        className="text-sm flex-grow cursor-pointer"
                      >
                        <span className="font-medium">{cls.name}</span>
                        {(() => {
                          const department = departments.find(
                            (d) => d.id === cls.department_id
                          );
                          const departmentName = department
                            ? department.name
                            : "ไม่ระบุแผนก";
                          return (
                            <span className="text-muted-foreground text-xs ml-2">
                              ({departmentName}
                              {cls.grade_level &&
                                `, ${
                                  cls.grade_level.level === "VOCATIONAL"
                                    ? "ปวช"
                                    : cls.grade_level.level === "HIGHER"
                                    ? "ปวส"
                                    : cls.grade_level.level
                                }${cls.grade_level.year}`}
                              )
                            </span>
                          );
                        })()}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Selection */}
          {(formData.team_type === "person" ||
            formData.team_type === "team") && (
            <div className="space-y-2">
              <label
                htmlFor="student_member_name"
                className="text-sm font-semibold leading-none flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  สมาชิก <span className="text-destructive">*</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {(formData.student_member_name as string[]).length} เลือกแล้ว
                  {formData.team_type === "person" && " / สูงสุด 1 คน"}
                </span>
              </label>
              <div className="border-2 border-dashed rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                {(formData.classroom_ids ?? []).length === 0 ||
                availableStudentOptions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-3">
                      <User className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {(formData.classroom_ids ?? []).length === 0
                        ? "กรุณาเลือกห้องเรียนก่อน"
                        : "ไม่มีนักเรียนในห้องเรียนที่เลือก"}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto p-3 space-y-4">
                    {departments
                      .filter((dept) =>
                        selectedDepartmentIds.includes(dept.id)
                      )
                      .map((dept) => (
                        <div key={dept.id} className="space-y-2">
                          <h4 className="text-sm font-bold text-primary-foreground bg-primary/80 px-3 py-1.5 rounded-md sticky top-0 z-10">
                            แผนก: {dept.name}
                          </h4>
                          <div className="space-y-1.5">
                            {filteredClassrooms
                              .filter((cls) => cls.department_id === dept.id)
                              .map((cls) => (
                                <div key={cls.id} className="space-y-1">
                                  <h5 className="text-sm font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                                    ห้องเรียน: {cls.name}
                                  </h5>
                                  <div className="space-y-1">
                                    {availableStudentOptions
                                      .filter(
                                        (student) =>
                                          student.classroomName === cls.name &&
                                          student.departmentName === dept.name
                                      )
                                      .map((student) => {
                                        const isDisabled =
                                          formData.team_type === "person" &&
                                          (
                                            formData.student_member_name as string[]
                                          ).length >= 1 &&
                                          !(
                                            formData.student_member_name as string[]
                                          ).includes(student.value);

                                        return (
                                          <div
                                            key={student.value}
                                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all border border-transparent ${
                                              isDisabled
                                                ? "opacity-40 cursor-not-allowed"
                                                : "hover:bg-accent/60 hover:border-border/50 hover:shadow-sm cursor-pointer"
                                            }`}
                                          >
                                            <Checkbox
                                              id={`student-${student.value}`}
                                              checked={(
                                                formData.student_member_name as string[]
                                              ).includes(student.value)}
                                              onCheckedChange={() =>
                                                handleStudentToggle(student.value)
                                              }
                                              disabled={isDisabled}
                                            />
                                            <label
                                              htmlFor={`student-${student.value}`}
                                              className={`text-sm flex-grow ${
                                                isDisabled
                                                  ? "cursor-not-allowed"
                                                  : "cursor-pointer"
                                              }`}
                                            >
                                              <span className="font-medium">
                                                {student.label}
                                              </span>
                                              <span className="text-muted-foreground text-xs ml-2">
                                                ({student.classroomName})
                                              </span>
                                            </label>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-6 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-[120px] h-11"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="min-w-[140px] h-11 bg-primary hover:bg-primary/90 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : currentTeam ? (
                "บันทึกการเปลี่ยนแปลง"
              ) : (
                "เพิ่มทีม"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamFormModal;
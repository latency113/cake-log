import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import InputField from "@/components/common/InputField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Loader2,
  Users,
  User,
  BookOpen,
  GraduationCap,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team, Classroom, Department } from "@/types";
import type { CreateTeamDto, UpdateTeamDto } from "@/types/team";
import type { InputChangeEvent } from "@/types/common";

// Lightweight, pure visual checkbox that avoids Radix Presence/BubbleInput overhead
const SimpleCheckbox: React.FC<{ checked: boolean; className?: string }> = ({
  checked,
  className,
}) => (
  <div
    className={cn(
      "h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center transition-all pointer-events-none select-none",
      checked
        ? "bg-primary border-primary text-primary-foreground shadow-2xs"
        : "border-input bg-background/80 hover:border-primary/50",
      className
    )}
  >
    {checked && <Check className="h-3 w-3 stroke-[3]" />}
  </div>
);

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
    id: "",
    name: "",
    classroom_ids: [],
    team_type: "team",
    student_member_name: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    []
  );

  // Custom Department Dropdown state & ref (replaces Radix Popover)
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // Search filter states
  const [studentSearch, setStudentSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  // Close department dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target as Node)
      ) {
        setDeptDropdownOpen(false);
      }
    };

    if (deptDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [deptDropdownOpen]);

  // Initialize form when modal opens or currentTeam changes
  useEffect(() => {
    if (isOpen) {
      if (currentTeam) {
        const classroomIds = currentTeam.classroom_ids || [];
        setFormData({
          id: currentTeam.id,
          name: currentTeam.name,
          classroom_ids: classroomIds,
          team_type: currentTeam.team_type,
          student_member_name: currentTeam.student_member_name || [],
        });

        // Find departments from classrooms
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
          id: "",
          name: "",
          classroom_ids: [],
          team_type: "team",
          student_member_name: [],
        });
        setSelectedDepartmentIds([]);
      }
      setStudentSearch("");
      setClassroomSearch("");
      setDeptSearch("");
      setDeptDropdownOpen(false);
      setIsSubmitting(false);
    }
  }, [currentTeam, isOpen]);

  // Derived filtered classrooms based on selected departments
  const filteredClassrooms = useMemo(() => {
    if (selectedDepartmentIds.length === 0) return [];
    const deptIdSet = new Set(selectedDepartmentIds);
    return classrooms.filter((cls) => deptIdSet.has(cls.department_id));
  }, [selectedDepartmentIds, classrooms]);

  // Derived available student options based on selected classrooms
  const availableStudentOptions = useMemo(() => {
    const list: {
      value: string;
      label: string;
      classroomName: string;
      classroomId: string;
      departmentName: string;
      departmentId: string;
    }[] = [];

    const selectedRoomSet = new Set(formData.classroom_ids ?? []);

    selectedRoomSet.forEach((roomId) => {
      const cls = classrooms.find((c) => c.id === roomId);
      if (cls && cls.students && cls.students.length > 0) {
        const dept = departments.find((d) => d.id === cls.department_id);
        const deptName = dept ? dept.name : "ไม่ระบุแผนก";
        cls.students.forEach((student) => {
          if (student && student.studentName) {
            list.push({
              value: student.studentName,
              label: student.studentName,
              classroomName: cls.name,
              classroomId: cls.id,
              departmentName: deptName,
              departmentId: cls.department_id,
            });
          }
        });
      }
    });

    // Unique by student name
    return Array.from(new Map(list.map((item) => [item.value, item])).values());
  }, [formData.classroom_ids, classrooms, departments]);

  // Filtered student options by search query
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return availableStudentOptions;
    const q = studentSearch.toLowerCase().trim();
    return availableStudentOptions.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.classroomName.toLowerCase().includes(q) ||
        s.departmentName.toLowerCase().includes(q)
    );
  }, [availableStudentOptions, studentSearch]);

  // Group filtered students by Department -> Classroom for clean organized display
  const groupedStudents = useMemo(() => {
    const deptMap = new Map<
      string,
      {
        deptId: string;
        deptName: string;
        classrooms: Map<
          string,
          {
            clsId: string;
            clsName: string;
            students: typeof filteredStudents;
          }
        >;
      }
    >();

    filteredStudents.forEach((student) => {
      const deptId = student.departmentId || "unknown";
      let deptEntry = deptMap.get(deptId);
      if (!deptEntry) {
        deptEntry = {
          deptId: deptId,
          deptName: student.departmentName || "ไม่ระบุแผนก",
          classrooms: new Map(),
        };
        deptMap.set(deptId, deptEntry);
      }

      const clsId = student.classroomId || "unknown";
      let classEntry = deptEntry.classrooms.get(clsId);
      if (!classEntry) {
        classEntry = {
          clsId: clsId,
          clsName: student.classroomName || "ไม่ระบุห้อง",
          students: [],
        };
        deptEntry.classrooms.set(clsId, classEntry);
      }

      classEntry.students.push(student);
    });

    return Array.from(deptMap.values()).map((d) => ({
      deptId: d.deptId,
      deptName: d.deptName,
      classrooms: Array.from(d.classrooms.values()),
    }));
  }, [filteredStudents]);

  // Filtered classroom display by search
  const displayedClassrooms = useMemo(() => {
    if (!classroomSearch.trim()) return filteredClassrooms;
    const q = classroomSearch.toLowerCase().trim();
    return filteredClassrooms.filter((cls) => {
      const dept = departments.find((d) => d.id === cls.department_id);
      return (
        cls.name.toLowerCase().includes(q) ||
        (dept && dept.name.toLowerCase().includes(q))
      );
    });
  }, [filteredClassrooms, classroomSearch, departments]);

  // Filtered department list inside dropdown
  const displayedDepartments = useMemo(() => {
    if (!deptSearch.trim()) return departments;
    const q = deptSearch.toLowerCase().trim();
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, deptSearch]);

  // Calculate distinct departments that currently have selected students
  const selectedStudents = (formData.student_member_name as string[]) || [];
  const representedDepartmentIds = useMemo(() => {
    const deptIds = new Set<string>();
    selectedStudents.forEach((studentName) => {
      const studentOpt = availableStudentOptions.find(
        (s) => s.value === studentName
      );
      if (studentOpt) {
        deptIds.add(studentOpt.departmentId);
      }
    });
    return deptIds;
  }, [selectedStudents, availableStudentOptions]);

  // Validation errors list with human-readable explanations
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!(formData.name ?? "").trim()) {
      errors.push("กรุณากรอกชื่อทีม");
    }
    if (selectedDepartmentIds.length === 0) {
      errors.push("กรุณาเลือกแผนกอย่างน้อย 1 แผนก");
    }
    if ((formData.classroom_ids ?? []).length === 0) {
      errors.push("กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง");
    }

    if (formData.team_type === "person") {
      if (selectedStudents.length === 0) {
        errors.push("กรุณาเลือกสมาชิก 1 คน");
      } else if (selectedStudents.length > 1) {
        errors.push("ประเภทบุคคลเลือกสมาชิกได้เพียง 1 คนเท่านั้น");
      }
    } else if (formData.team_type === "team") {
      if (selectedStudents.length === 0) {
        errors.push("กรุณาเลือกสมาชิกอย่างน้อย 1 คน");
      } else if (selectedDepartmentIds.length > 1) {
        if (representedDepartmentIds.size < 2) {
          errors.push(
            `เนื่องจากเลือกไว้ ${selectedDepartmentIds.length} แผนก ต้องมีสมาชิกตัวแทนจากอย่างน้อย 2 แผนกขึ้นไป (ปัจจุบันมีตัวแทนจาก ${representedDepartmentIds.size} แผนก)`
          );
        }
      }
    }

    return errors;
  }, [
    formData.name,
    selectedDepartmentIds.length,
    formData.classroom_ids,
    formData.team_type,
    selectedStudents.length,
    representedDepartmentIds.size,
  ]);

  const isValid = validationErrors.length === 0;

  // Form field handlers
  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamTypeChange = (value: "team" | "person") => {
    setFormData((prev) => {
      const currentStudents = (prev.student_member_name || []) as string[];
      return {
        ...prev,
        team_type: value,
        student_member_name:
          value === "person" ? currentStudents.slice(0, 1) : currentStudents,
      };
    });
  };

  const handleSelectAllDepartments = () => {
    setSelectedDepartmentIds(departments.map((dept) => dept.id));
  };

  const handleClearAllDepartments = () => {
    setSelectedDepartmentIds([]);
    setFormData((prev) => ({
      ...prev,
      classroom_ids: [],
      student_member_name: [],
    }));
  };

  const handleDepartmentToggle = (departmentId: string) => {
    const nextDeptIds = selectedDepartmentIds.includes(departmentId)
      ? selectedDepartmentIds.filter((id) => id !== departmentId)
      : [...selectedDepartmentIds, departmentId];

    setSelectedDepartmentIds(nextDeptIds);

    // Prune classrooms & students that belong to unselected departments
    const validDeptSet = new Set(nextDeptIds);
    const validClassrooms = classrooms.filter((cls) =>
      validDeptSet.has(cls.department_id)
    );
    const validClassroomIds = new Set(validClassrooms.map((c) => c.id));

    setFormData((prev) => {
      const nextClassroomIds = (prev.classroom_ids ?? []).filter((id) =>
        validClassroomIds.has(id)
      );
      const remainingRooms = classrooms.filter((cls) =>
        nextClassroomIds.includes(cls.id)
      );
      const validStudentNames = new Set<string>();
      remainingRooms.forEach((cls) => {
        cls.students?.forEach((s) => validStudentNames.add(s.studentName));
      });

      return {
        ...prev,
        classroom_ids: nextClassroomIds,
        student_member_name: (prev.student_member_name ?? []).filter((name) =>
          validStudentNames.has(name)
        ),
      };
    });
  };

  const handleSelectAllFilteredClassrooms = () => {
    const allFilteredIds = filteredClassrooms.map((c) => c.id);
    setFormData((prev) => ({
      ...prev,
      classroom_ids: Array.from(
        new Set([...(prev.classroom_ids ?? []), ...allFilteredIds])
      ),
    }));
  };

  const handleClearAllFilteredClassrooms = () => {
    const filteredIdSet = new Set(filteredClassrooms.map((c) => c.id));
    setFormData((prev) => {
      const nextClassroomIds = (prev.classroom_ids ?? []).filter(
        (id) => !filteredIdSet.has(id)
      );
      const remainingRooms = classrooms.filter((cls) =>
        nextClassroomIds.includes(cls.id)
      );
      const validStudentNames = new Set<string>();
      remainingRooms.forEach((cls) => {
        cls.students?.forEach((s) => validStudentNames.add(s.studentName));
      });

      return {
        ...prev,
        classroom_ids: nextClassroomIds,
        student_member_name: (prev.student_member_name ?? []).filter((name) =>
          validStudentNames.has(name)
        ),
      };
    });
  };

  const handleClassroomToggle = (classroomId: string) => {
    setFormData((prev) => {
      const currentIds = prev.classroom_ids ?? [];
      const isSelected = currentIds.includes(classroomId);
      const nextIds = isSelected
        ? currentIds.filter((id) => id !== classroomId)
        : [...currentIds, classroomId];

      let nextStudents = (prev.student_member_name || []) as string[];
      if (isSelected) {
        const removedClassroom = classrooms.find((c) => c.id === classroomId);
        if (removedClassroom && removedClassroom.students) {
          const removedStudentNames = new Set(
            removedClassroom.students.map((s) => s.studentName)
          );
          nextStudents = nextStudents.filter(
            (name) => !removedStudentNames.has(name)
          );
        }
      }

      return {
        ...prev,
        classroom_ids: nextIds,
        student_member_name: nextStudents,
      };
    });
  };

  const handleStudentToggle = (studentName: string) => {
    setFormData((prev) => {
      const currentStudents = (prev.student_member_name || []) as string[];

      if (prev.team_type === "person") {
        if (currentStudents.includes(studentName)) {
          return { ...prev, student_member_name: [] };
        } else {
          return { ...prev, student_member_name: [studentName] };
        }
      } else {
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
      }
    });
  };

  const handleToggleAllStudentsInClassroom = (roomId: string) => {
    if (formData.team_type === "person") return;

    const roomStudents = availableStudentOptions
      .filter((s) => s.classroomId === roomId)
      .map((s) => s.value);

    if (roomStudents.length === 0) return;

    const currentSelected = new Set(
      (formData.student_member_name as string[]) || []
    );
    const allSelected = roomStudents.every((name) =>
      currentSelected.has(name)
    );

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        student_member_name: (
          (prev.student_member_name as string[]) || []
        ).filter((name) => !roomStudents.includes(name)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        student_member_name: Array.from(
          new Set([
            ...((prev.student_member_name as string[]) || []),
            ...roomStudents,
          ])
        ),
      }));
    }
  };

  const handleClearAllStudents = () => {
    setFormData((prev) => ({
      ...prev,
      student_member_name: [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background text-foreground max-w-5xl w-[96vw] h-[92vh] max-h-[880px] p-0 flex flex-col overflow-hidden shadow-2xl border">
        {/* Header */}
        <DialogHeader className="px-6 py-3.5 border-b shrink-0 flex flex-row items-center justify-between space-y-0 bg-muted/20">
          <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="leading-tight">
                {currentTeam ? "แก้ไขข้อมูลทีม" : "เพิ่มทีมใหม่"}
              </div>
              <div className="text-xs font-normal text-muted-foreground mt-0.5">
                {currentTeam
                  ? "แก้ไขชื่อทีม สมาชิก และห้องเรียนที่สังกัด"
                  : "กรอกข้อมูลทั่วไปและเลือกสมาชิกทีมในขั้นตอนเดียว"}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Form Body - 2 Columns */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x overflow-y-auto lg:overflow-hidden">
            {/* Left Column: Team Settings, Departments & Classrooms */}
            <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto flex flex-col bg-card">
              {/* Team Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold flex items-center gap-1.5 text-foreground"
                >
                  <Users className="h-3.5 w-3.5 text-primary" />
                  ชื่อทีม <span className="text-destructive">*</span>
                </label>
                <InputField
                  id="name"
                  name="name"
                  value={formData.name ?? ""}
                  onChange={handleChange}
                  required
                  className="w-full h-9 text-sm"
                  placeholder="กรอกชื่อทีม เช่น ทีมการตลาด 1"
                />
              </div>

              {/* Team Type: Visual Radio Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  ประเภททีม <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTeamTypeChange("team")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                      formData.team_type === "team"
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/30 hover:bg-muted text-muted-foreground border-border"
                    )}
                  >
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>ทีม (หลายคน)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTeamTypeChange("person")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                      formData.team_type === "person"
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/30 hover:bg-muted text-muted-foreground border-border"
                    )}
                  >
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>บุคคล (1 คน)</span>
                  </button>
                </div>
              </div>

              {/* Department Multi-Select (Native clean dropdown with click-outside) */}
              <div className="space-y-1.5" ref={deptDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    แผนกวิชา <span className="text-destructive">*</span>
                  </label>
                  <Badge variant="outline" className="text-[11px] font-normal px-2 py-0">
                    {selectedDepartmentIds.length}/{departments.length} แผนก
                  </Badge>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                    className="w-full h-9 flex items-center justify-between px-3 py-1.5 border rounded-md text-xs bg-background hover:bg-accent/40 transition-colors cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <span className="truncate">
                      {selectedDepartmentIds.length === 0
                        ? "คลิกเพื่อเลือกแผนก..."
                        : selectedDepartmentIds.length === departments.length
                        ? "ทุกแผนกวิชา"
                        : departments
                            .filter((d) => selectedDepartmentIds.includes(d.id))
                            .map((d) => d.name)
                            .slice(0, 2)
                            .join(", ") +
                          (selectedDepartmentIds.length > 2
                            ? ` +${selectedDepartmentIds.length - 2}`
                            : "")}
                    </span>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </button>

                  {/* Dropdown Panel */}
                  {deptDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-full z-30 rounded-lg border bg-popover text-popover-foreground shadow-xl p-2 space-y-2 animate-in fade-in-50 zoom-in-95">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={deptSearch}
                          onChange={(e) => setDeptSearch(e.target.value)}
                          placeholder="ค้นหาแผนก..."
                          className="w-full h-8 pl-8 pr-2 text-xs rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2 border-b pb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={handleSelectAllDepartments}
                          className="flex-1 h-7 text-xs"
                        >
                          เลือกทั้งหมด
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={handleClearAllDepartments}
                          className="flex-1 h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                          ล้างทั้งหมด
                        </Button>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto p-0.5 space-y-0.5">
                        {displayedDepartments.map((dept) => {
                          const isChecked = selectedDepartmentIds.includes(dept.id);
                          return (
                            <div
                              key={dept.id}
                              onClick={() => handleDepartmentToggle(dept.id)}
                              className="flex items-center space-x-2.5 px-2.5 py-1.5 hover:bg-accent/60 cursor-pointer rounded-md transition-colors select-none"
                            >
                              <SimpleCheckbox checked={isChecked} />
                              <span className="text-xs flex-grow font-medium">
                                {dept.name}
                              </span>
                            </div>
                          );
                        })}
                        {displayedDepartments.length === 0 && (
                          <p className="text-center py-4 text-xs text-muted-foreground">
                            ไม่พบแผนกที่ตรงกัน
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Departments Chips */}
                {selectedDepartmentIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                    {departments
                      .filter((d) => selectedDepartmentIds.includes(d.id))
                      .map((dept) => (
                        <Badge
                          key={dept.id}
                          variant="secondary"
                          className="text-[11px] font-normal pl-2 pr-1 py-0.5 flex items-center gap-1 bg-muted hover:bg-muted/80"
                        >
                          <span>{dept.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDepartmentToggle(dept.id)}
                            className="rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 text-muted-foreground transition-colors cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              {/* Classroom Selection */}
              <div className="space-y-1.5 flex flex-col flex-1 min-h-[220px]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    ห้องเรียน <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {filteredClassrooms.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSelectAllFilteredClassrooms}
                          className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                        >
                          เลือกทั้งหมด
                        </button>
                        <span className="text-muted-foreground text-[10px]">•</span>
                        <button
                          type="button"
                          onClick={handleClearAllFilteredClassrooms}
                          className="text-[11px] text-muted-foreground hover:text-destructive font-medium cursor-pointer"
                        >
                          ล้าง
                        </button>
                      </div>
                    )}
                    <Badge variant="outline" className="text-[11px] font-normal px-2 py-0">
                      {(formData.classroom_ids ?? []).length}/{filteredClassrooms.length} ห้อง
                    </Badge>
                  </div>
                </div>

                {/* Classroom Search Filter if list has items */}
                {filteredClassrooms.length > 4 && (
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={classroomSearch}
                      onChange={(e) => setClassroomSearch(e.target.value)}
                      placeholder="กรองห้องเรียน..."
                      className="w-full h-8 pl-8 pr-2 text-xs rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Classroom List */}
                <div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-background">
                  {selectedDepartmentIds.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <GraduationCap className="h-8 w-8 mb-2 opacity-30" />
                      <p className="text-xs font-medium">กรุณาเลือกแผนกวิชาด้านบนก่อน</p>
                    </div>
                  ) : filteredClassrooms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8 mb-2 opacity-30" />
                      <p className="text-xs font-medium">ไม่พบห้องเรียนในแผนกที่เลือก</p>
                    </div>
                  ) : (
                    <div className="h-full max-h-[220px] overflow-y-auto p-2 space-y-1 divide-y divide-border/30">
                      {displayedClassrooms.map((cls) => {
                        const isSelected = (formData.classroom_ids ?? []).includes(
                          cls.id
                        );
                        const dept = departments.find(
                          (d) => d.id === cls.department_id
                        );
                        const studentCount = cls.students?.length ?? 0;
                        const gradeText = cls.grade_level
                          ? `${
                              cls.grade_level.level === "VOCATIONAL"
                                ? "ปวช."
                                : cls.grade_level.level === "HIGHER"
                                ? "ปวส."
                                : cls.grade_level.level
                            }${cls.grade_level.year}`
                          : "";

                        return (
                          <div
                            key={cls.id}
                            onClick={() => handleClassroomToggle(cls.id)}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer text-xs select-none",
                              isSelected
                                ? "bg-primary/10 border-primary/20 text-foreground font-medium"
                                : "hover:bg-muted/60 text-muted-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <SimpleCheckbox checked={isSelected} />
                              <div className="truncate">
                                <span className="text-foreground font-semibold">
                                  {cls.name}
                                </span>
                                {gradeText && (
                                  <span className="ml-1.5 text-[11px] text-muted-foreground">
                                    ({gradeText})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {dept && selectedDepartmentIds.length > 1 && (
                                <span className="text-[10px] text-muted-foreground max-w-[90px] truncate">
                                  {dept.name}
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                                {studentCount} คน
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {displayedClassrooms.length === 0 && (
                        <p className="text-center py-6 text-xs text-muted-foreground">
                          ไม่พบห้องเรียนที่ตรงกับคำค้นหา
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Student Members Live Search, Badges & Multi-selection */}
            <div className="lg:col-span-7 p-5 space-y-3 flex flex-col min-h-0 overflow-hidden bg-muted/10">
              {/* Top Controls: Search Bar & Selected Counter */}
              <div className="space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      เลือกสมาชิกทีม / นักเรียน
                    </span>
                    <span className="text-destructive text-xs">*</span>
                  </div>
                  <Badge
                    variant={selectedStudents.length > 0 ? "default" : "secondary"}
                    className="text-xs font-semibold px-2.5 py-0.5"
                  >
                    เลือกแล้ว {selectedStudents.length} คน
                    {formData.team_type === "person" && " (โหมดบุคคล: 1 คน)"}
                  </Badge>
                </div>

                {/* Live Search Input */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="ค้นหาชื่อนักเรียน หรือห้องเรียน..."
                    className="w-full h-9 pl-9 pr-8 text-xs rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
                  />
                  {studentSearch && (
                    <button
                      type="button"
                      onClick={() => setStudentSearch("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Validation Feedback Banner */}
              {formData.team_type === "team" && selectedDepartmentIds.length > 1 && (
                <div
                  className={cn(
                    "p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all shrink-0",
                    representedDepartmentIds.size >= 2
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  )}
                >
                  {representedDepartmentIds.size >= 2 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-semibold">
                          เงื่อนไขทีมข้ามแผนกผ่านแล้ว:
                        </span>{" "}
                        มีสมาชิกตัวแทนจาก {representedDepartmentIds.size} แผนก
                        (ตรงตามเกณฑ์อย่างน้อย 2 แผนกขึ้นไป)
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <span className="font-semibold">
                          ข้อกำหนดทีมข้ามแผนก:
                        </span>{" "}
                        คุณเลือกไว้ {selectedDepartmentIds.length} แผนก
                        จึงต้องมีสมาชิกตัวแทนจากอย่างน้อย 2 แผนกขึ้นไป
                        (ปัจจุบันมีตัวแทนจาก {representedDepartmentIds.size} แผนก)
                      </div>
                    </>
                  )}
                </div>
              )}

              {formData.team_type === "person" && (
                <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2 shrink-0">
                  <User className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    โหมดบุคคล: เลือกสมาชิกได้เพียง 1 คน (คลิกนักเรียนเพื่อสลับคนได้ทันที)
                  </span>
                </div>
              )}

              {/* Selected Members Chips Tray */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-card border shadow-2xs shrink-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      สมาชิกที่ถูกเลือก ({selectedStudents.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllStudents}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium cursor-pointer"
                    >
                      ล้างสมาชิกทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {selectedStudents.map((name) => {
                      const sOption = availableStudentOptions.find(
                        (s) => s.value === name
                      );
                      return (
                        <Badge
                          key={name}
                          variant="secondary"
                          className="pl-2 pr-1 py-0.5 flex items-center gap-1.5 bg-background border text-xs font-normal shadow-2xs"
                        >
                          <span className="font-medium text-foreground">
                            {name}
                          </span>
                          {sOption && (
                            <span className="text-[10px] text-muted-foreground">
                              ({sOption.classroomName})
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStudentToggle(name)}
                            className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 text-muted-foreground transition-colors cursor-pointer"
                            title="นำออก"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Student Selection List: Grouped by Dept & Classroom */}
              <div className="flex-1 min-h-0 border rounded-lg overflow-y-auto bg-background p-3">
                {(formData.classroom_ids ?? []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <BookOpen className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-semibold">ยังไม่ได้เลือกห้องเรียน</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                      กรุณาเลือกแผนกและห้องเรียนจากคอลัมน์ฝั่งซ้ายก่อนเพื่อแสดงรายชื่อนักเรียน
                    </p>
                  </div>
                ) : availableStudentOptions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <User className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-semibold">ไม่มีนักเรียนในห้องที่เลือก</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      ห้องเรียนที่เลือกไว้ยังไม่มีรายชื่อนักเรียนในระบบ
                    </p>
                  </div>
                ) : groupedStudents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <Search className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-semibold">ไม่พบนักเรียนที่ค้นหา</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      ไม่มีนักเรียนที่ตรงกับคำค้นหา "{studentSearch}"
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStudentSearch("")}
                      className="mt-3 text-xs h-8"
                    >
                      ล้างคำค้นหา
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedStudents.map((deptGroup) => (
                      <div
                        key={deptGroup.deptId}
                        className="rounded-lg border bg-muted/5 overflow-hidden"
                      >
                        {/* Department Banner Header */}
                        <div className="bg-muted/60 px-3 py-1.5 flex items-center justify-between border-b">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            แผนก: {deptGroup.deptName}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                            {deptGroup.classrooms.reduce(
                              (acc, c) => acc + c.students.length,
                              0
                            )}{" "}
                            คน
                          </span>
                        </div>

                        {/* Classrooms inside Department */}
                        <div className="p-2 space-y-3">
                          {deptGroup.classrooms.map((roomGroup) => {
                            const roomStudentNames = roomGroup.students.map(
                              (s) => s.value
                            );
                            const allInRoomSelected =
                              roomStudentNames.length > 0 &&
                              roomStudentNames.every((name) =>
                                selectedStudents.includes(name)
                              );

                            return (
                              <div
                                key={roomGroup.clsId}
                                className="rounded-md border bg-card/60 p-2.5 space-y-2"
                              >
                                {/* Classroom Subheader with Quick Action */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-foreground">
                                      ห้อง {roomGroup.clsName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      ({roomGroup.students.length} คน)
                                    </span>
                                  </div>

                                  {/* Quick Select All Button (Disabled in person mode) */}
                                  {formData.team_type === "team" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleAllStudentsInClassroom(
                                          roomGroup.clsId
                                        )
                                      }
                                      className={cn(
                                        "text-[11px] font-medium px-2 py-0.5 rounded transition-colors cursor-pointer",
                                        allInRoomSelected
                                          ? "text-destructive hover:bg-destructive/10"
                                          : "text-primary hover:bg-primary/10"
                                      )}
                                    >
                                      {allInRoomSelected
                                        ? "ยกเลิกทั้งห้อง"
                                        : "เลือกทั้งห้อง"}
                                    </button>
                                  )}
                                </div>

                                {/* Student Checkboxes Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {roomGroup.students.map((student) => {
                                    const isChecked = selectedStudents.includes(
                                      student.value
                                    );

                                    return (
                                      <div
                                        key={student.value}
                                        onClick={() =>
                                          handleStudentToggle(student.value)
                                        }
                                        className={cn(
                                          "flex items-center space-x-2 p-2 rounded-md transition-all cursor-pointer border text-xs select-none",
                                          isChecked
                                            ? "bg-primary/10 border-primary/30 text-foreground font-medium shadow-2xs"
                                            : "border-transparent hover:bg-muted/70 text-foreground/80 hover:border-border"
                                        )}
                                      >
                                        <SimpleCheckbox checked={isChecked} />
                                        <span className="flex-grow truncate">
                                          {student.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer with Real-time Validation Message & Actions */}
          <DialogFooter className="px-6 py-3.5 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
            {/* Validation Status Text on Left */}
            <div className="flex items-center gap-2 text-xs">
              {isValid ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>ข้อมูลครบถ้วน พร้อมบันทึก</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium max-w-md truncate">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">{validationErrors[0]}</span>
                  {validationErrors.length > 1 && (
                    <span className="text-muted-foreground text-[11px] shrink-0">
                      (+{validationErrors.length - 1})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons on Right */}
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="h-9 px-5 text-xs bg-primary hover:bg-primary/90 shadow-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : currentTeam ? (
                  "บันทึกการเปลี่ยนแปลง"
                ) : (
                  "เพิ่มทีม"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamFormModal;

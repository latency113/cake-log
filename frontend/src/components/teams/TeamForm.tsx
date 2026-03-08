import React, { useState, useEffect } from "react";
import InputField from "../common/InputField";
import { Button } from "../ui/button";
import { createTeam } from "../../utils/api/teams";
import { showToastSuccess, showToastError } from "../../utils/alerts";
import { getDepartments } from "../../utils/api/departments";
import { getClassrooms } from "../../utils/api/classrooms";
import type { Department, Classroom, InputChangeEvent } from "../../types";
import type { CreateTeamDto } from "../../types/team"; // Import CreateTeamDto
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Loader2 } from "lucide-react";

interface TeamFormProps {
  onTeamAdded?: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ onTeamAdded }) => {
  const [formData, setFormData] = useState<CreateTeamDto>({
    name: "",
    classroom_ids: [],
    team_type: "team", // Default value
    student_member_name: [], // Initialize as empty array
  });
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [availableStudentOptions, setAvailableStudentOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsResponse, classroomsResponse] = await Promise.all([
          getDepartments(1, 9999),
          getClassrooms(1, 9999),
        ]);
        setAllDepartments(departmentsResponse.data);
        setAllClassrooms(classroomsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        showToastError({ title: "Error", text: "Failed to load data." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const departmentClassrooms = allClassrooms.filter(
        (cls) => cls.department_id === selectedDepartment
      );
      setFilteredClassrooms(departmentClassrooms);
      setFormData((prev) => ({
        ...prev,
        classroom_ids: prev.classroom_ids.filter((id) =>
          departmentClassrooms.some((cls) => cls.id === id)
        ),
      }));
    } else {
      setFilteredClassrooms([]);
      setFormData((prev) => ({ ...prev, classroom_ids: [] }));
    }
  }, [selectedDepartment, allClassrooms]);

  useEffect(() => {
    const studentsFromSelectedClassrooms: { value: string; label: string }[] = [];
    formData.classroom_ids.forEach(classroomId => {
      const classroom = allClassrooms.find(cls => cls.id === classroomId);
      if (classroom && classroom.students) {
        classroom.students.forEach(student => {
          studentsFromSelectedClassrooms.push({ value: student.studentName, label: student.studentName });
        });
      }
    });
    // Remove duplicates
    const uniqueStudents = Array.from(new Map(studentsFromSelectedClassrooms.map(item => [item.value, item])).values());
    setAvailableStudentOptions(uniqueStudents);

    // If the currently selected student is not in the new list, clear it
    if (formData.student_member_name && formData.student_member_name.length > 0) {
      const newStudentNames = formData.student_member_name.filter(name => uniqueStudents.some(s => s.value === name));
      if (newStudentNames.length !== formData.student_member_name.length) {
        setFormData(prev => ({ ...prev, student_member_name: newStudentNames }));
      }
    }
  }, [formData.classroom_ids, allClassrooms]);

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setFormData((prev) => ({ ...prev, classroom_ids: [], student_member_name: [] })); // Clear student when department changes
  };

  const handleClassroomToggle = (id: string) => {
    setFormData((prev) => {
      const currentIds = prev.classroom_ids;
      const newClassroomIds = currentIds.includes(id)
        ? currentIds.filter((classroomId) => classroomId !== id)
        : [...currentIds, id];
      return { ...prev, classroom_ids: newClassroomIds };
    });
  };

  const handleTeamTypeChange = (value: "team" | "person") => {
    setFormData((prev) => ({
      ...prev,
      team_type: value,
      student_member_name: [], // Clear student selection when team type changes
    }));
  };


  const handleStudentToggle = (studentName: string) => {
    setFormData(prev => {
      const currentStudents = (prev.student_member_name || []) as string[];
      if (currentStudents.includes(studentName)) {
        return { ...prev, student_member_name: currentStudents.filter(name => name !== studentName) };
      } else {
        return { ...prev, student_member_name: [...currentStudents, studentName] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isFormValid()) {
      showToastError({ title: "Error", text: "Please fill in all required fields." });
      setIsSubmitting(false);
      return;
    }

    try {
      await createTeam(formData);
      showToastSuccess({ title: "Success", text: "Team added successfully!" });
      setFormData({ name: "", classroom_ids: [], team_type: "team", student_member_name: [] }); // Reset form
      setSelectedDepartment("");
      onTeamAdded?.();
    } catch (error) {
      console.error("Error adding team:", error);
      showToastError({ title: "Error", text: "Failed to add team." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const baseValid = formData.name.trim() !== "" && formData.classroom_ids.length > 0;
    if (formData.team_type === "person") {
      return baseValid && (formData.student_member_name as string[]).length === 1;
    } else if (formData.team_type === "team") {
      return baseValid && (formData.student_member_name as string[]).length > 0;
    }
    return baseValid;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-muted-foreground">Loading data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <InputField
        id="name"
        name="name"
        label="ชื่อทีม *"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full"
      />

      {/* Team Type Select */}
      <div className="grid gap-2">
        <label htmlFor="team_type" className="text-sm font-medium leading-none">
          ประเภททีม *
        </label>
        <Select
          onValueChange={handleTeamTypeChange}
          value={formData.team_type}
          required
        >
          <SelectTrigger id="team_type" className="w-full">
            <SelectValue placeholder="เลือกประเภททีม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">ทีม</SelectItem>
            <SelectItem value="person">บุคคล</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Member Name Select */}
      {(formData.team_type === "person" || formData.team_type === "team") && (
        <div className="grid gap-2">
          <label htmlFor="student_member_name" className="text-sm font-medium leading-none">
            ชื่อนักเรียน (สำหรับประเภทบุคคล/ทีม) *
          </label>
          <div className="border rounded-md p-3 max-h-60 overflow-y-auto bg-background">
            {formData.classroom_ids.length === 0 || availableStudentOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {formData.classroom_ids.length === 0 ? "กรุณาเลือกห้องเรียนก่อน" : "ไม่มีนักเรียนให้เลือกในห้องเรียนที่เลือก"}
              </p>
            ) : (
              <div className="space-y-2">
                {availableStudentOptions.map((student) => (
                  <div key={student.value} className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                    <Checkbox
                      id={`student-${student.value}`}
                      checked={(formData.student_member_name as string[]).includes(student.value)}
                      onCheckedChange={() => handleStudentToggle(student.value)}
                      disabled={formData.team_type === "person" && (formData.student_member_name as string[]).length >= 1 && !(formData.student_member_name as string[]).includes(student.value)}
                    />
                    <label
                      htmlFor={`student-${student.value}`}
                      className="text-sm flex-grow cursor-pointer"
                    >
                      {student.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Department Select */}
      <div className="grid gap-2">
        <label htmlFor="department" className="text-sm font-medium leading-none">
          แผนก *
        </label>
        <Select
          onValueChange={handleDepartmentChange}
          value={selectedDepartment}
          required
        >
          <SelectTrigger id="department" className="w-full">
            <SelectValue placeholder="เลือกแผนก" />
          </SelectTrigger>
          <SelectContent>
            {allDepartments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classroom Multi-Select */}
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-none">
          ห้องเรียน * ({formData.classroom_ids.length} เลือกแล้ว)
        </label>
        <div className="border rounded-md p-3 max-h-60 overflow-y-auto bg-background">
          {!selectedDepartment || filteredClassrooms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {!selectedDepartment ? "กรุณาเลือกแผนกก่อน" : "ไม่มีห้องเรียนในแผนกนี้"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredClassrooms.map((cls) => (
                <div key={cls.id} className="flex items-center space-x-2 hover:bg-accent p-2 rounded">
                  <Checkbox
                    id={`classroom-${cls.id}`}
                    checked={formData.classroom_ids.includes(cls.id)}
                    onCheckedChange={() => handleClassroomToggle(cls.id)}
                  />
                  <label
                    htmlFor={`classroom-${cls.id}`}
                    className="text-sm flex-grow cursor-pointer"
                  >
                    {cls.name}
                    {cls.grade_level && (
                      <span className="text-muted-foreground ml-2">
                        ({cls.grade_level.level === "VOCATIONAL" ? "ปวช" : cls.grade_level.level === "HIGHER" ? "ปวส" : cls.grade_level.level} {cls.grade_level.year})
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid() || isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            กำลังบันทึก...
          </>
        ) : (
          "เพิ่มทีม"
        )}
      </Button>
    </form>
  );
};

export default TeamForm;

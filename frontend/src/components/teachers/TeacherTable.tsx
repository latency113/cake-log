import React, { useEffect, useState } from "react";
import type { Teacher } from "../../types/teacher";
import { getDepartments } from "../../utils/api/departments";
import type { Department } from "../../types/department";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus } from "lucide-react";

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  onEdit,
  onDelete,
}) => {

  const [departmentMap, setDepartmentMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await getDepartments();

        const map = new Map<string, string>();
        departmentsData.data.forEach((dept: Department) => {
          map.set(dept.id, dept.name);
        });
        setDepartmentMap(map);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []); // Empty dependency array means this runs once on mount
  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UserPlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">ยังไม่มีครู</h3>
        <p className="max-w-sm text-muted-foreground">
          เมื่อมีการเพิ่มครูใหม่ ข้อมูลจะแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อครู</TableHead>
            <TableHead>แผนก</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell className="font-medium text-foreground">
                {teacher.name}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {departmentMap.get(teacher.department_id) || "ไม่ระบุแผนก"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(teacher)}>
                      แก้ไข
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(teacher)}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherTable;

import React from "react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Building } from "lucide-react";

interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({ departments, onEdit, onDelete }) => {
  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Building className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          ยังไม่มีแผนก
        </h3>
        <p className="max-w-sm text-muted-foreground">
          เมื่อมีการเพิ่มแผนกใหม่ ข้อมูลจะแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อแผนก</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium text-foreground">
                {department.name}
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
                    <DropdownMenuItem onClick={() => onEdit(department)}>
                      แก้ไข
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(department)}
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

export default DepartmentTable;

import React from "react";
import type { User } from "../../types";

// Import components from shadcn/ui and an icon library
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus } from "lucide-react"; // Or any other icon library

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UserPlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          ยังไม่มีผู้ใช้งาน
        </h3>
        <p className="max-w-sm text-muted-foreground">
          เมื่อมีการเพิ่มผู้ใช้งานใหม่ ข้อมูลจะแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>ชื่อผู้ใช้</TableHead>
            <TableHead>อีเมล</TableHead>
            <TableHead>บทบาท</TableHead>
            <TableHead>วันที่สร้าง</TableHead>
            <TableHead>วันที่อัพเดท</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar>
                  {/* Assuming you have an avatarUrl property */}
                  {/* <AvatarImage src={user.avatarUrl} /> */}
                  <AvatarFallback>
                    {user.firstname?.charAt(0)}
                    {user.lastname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="text-foreground">
                    {user.firstname} {user.lastname}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.email || "N/A"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === "SUPERADMIN"
                      ? "destructive"
                      : user.role === "OFFICER1"
                      ? "default"
                      : user.role === "OFFICER2"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {user.role === "SUPERADMIN"
                    ? "ผู้ดูแลระบบ"
                    : user.role === "OFFICER1"
                    ? "เจ้าหน้าที่จ่ายเค้ก"
                    : user.role === "OFFICER2"
                    ? "เจ้าหน้าที่จัดเตรียมเค้ก"
                    : user.role === "ADMIN"
                    ? "ผู้บริหาร"
                    : "ผู้ใช้งานทั่วไป"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt ?? "").toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.updatedAt ?? "").toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
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
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      แก้ไข
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
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

export default UsersTable;

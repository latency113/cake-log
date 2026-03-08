import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getDepartments } from "../../utils/api/departments";
import type { Department, Team } from "../../types"; // Import Team type
// import { Trash } from "lucide-react";

interface OrdersActionBarProps {
  searchTerm: string;
  statusFilter: string;
  departmentFilter: string;
  dateFilter: string;
  teamFilter: string; // New prop for team filter
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusFilterChange: (status: string) => void;
  onDepartmentFilterChange: (departmentId: string) => void;
  onDateFilterChange: (filter: string) => void;
  onTeamFilterChange: (teamId: string) => void; // New prop for team filter change
  onExport: () => void;
  deleteOrder: (totalSalesPounds: number, totalSalesBaht: number) => void;
  totalSalesPounds: number;
  totalSalesBaht: number;
  allTeams: Map<string, Team>; // Changed from Map<string, string> to Map<string, Team>
}

const OrdersActionBar: React.FC<OrdersActionBarProps> = ({
  searchTerm,
  statusFilter,
  departmentFilter,
  dateFilter,
  teamFilter, // New prop
  onSearchChange,
  onStatusFilterChange,
  onDepartmentFilterChange,
  onDateFilterChange,
  onTeamFilterChange, // New prop
  // onExport,
  // deleteOrder,
  // totalSalesPounds,
  // totalSalesBaht,
  allTeams, // New prop
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="bg-card rounded-t-lg shadow-md border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Existing search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, เลขที่ออร์เดอร์..."
              className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              value={searchTerm}
              onChange={onSearchChange}
            />
            <svg
              className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Date filter */}
          <Select onValueChange={onDateFilterChange} value={dateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="today">วันนี้</SelectItem>
              <SelectItem value="this_week">สัปดาห์นี้</SelectItem>
              <SelectItem value="this_month">เดือนนี้</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select onValueChange={onStatusFilterChange} value={statusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="pending">อยู่ระหว่างดำเนินการ</SelectItem>
              <SelectItem value="approved">เตรียมเค้กเสร็จสิ้น</SelectItem>
              <SelectItem value="complete">เสร็จสิ้น</SelectItem>
            </SelectContent>
          </Select>
          {/* Department filter */}
          <Select
            onValueChange={onDepartmentFilterChange}
            value={departmentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกแผนก</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Team filter (NEW) */}
          <Select onValueChange={onTeamFilterChange} value={teamFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกทีม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกทีม</SelectItem>
              {Array.from(allTeams.entries()).map(([teamId, teamObject]) => (
                <SelectItem key={teamId} value={teamId}>
                  {teamObject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <button
            className="bg-red-500 p-2 rounded-lg text-white hover:bg-red-800 cursor-pointer"
            onClick={() => deleteOrder(totalSalesPounds, totalSalesBaht)}
          >
            <span className="flex gap-2">
              <Trash />
              เคลียร์ข้อมูลออเดอร์ทั้งหมด
            </span>
          </button> */}
        </div>
        {/* <div className="flex items-center space-x-3">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>ดาวน์โหลด</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OrdersActionBar;

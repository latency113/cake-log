import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { Department} from "../../types";

interface OrderSearchActionBarProps {
  searchTerm: string;
  filterTerm: string;
  DepartmentFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (value: string) => void;
  onDepartmentFilterChange: (DepartmentId: string) => void;
  allDepartments: Department[];
  showUserOrdersOnly: boolean;
  onShowUserOrdersOnlyChange: (value: boolean) => void;
  onShowClassroomSummary: () => void; // New prop for showing classroom summary
}

const OrderSearchActionBar: React.FC<OrderSearchActionBarProps> = ({
  searchTerm,
  filterTerm,
  DepartmentFilter,
  onSearchChange,
  onFilterChange,
  onDepartmentFilterChange,
  allDepartments,
  showUserOrdersOnly,
  onShowUserOrdersOnlyChange,
  onShowClassroomSummary, // Destructure new prop
}) => {

  return (
    <div className="bg-card rounded-sm shadow-lg border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Search input */}
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

          <Select
            onValueChange={onFilterChange}
            value={filterTerm}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="today">วันนี้</SelectItem>
              <SelectItem value="this_week">สัปดาห์นี้</SelectItem>
              <SelectItem value="this_month">เดือนนี้</SelectItem>
            </SelectContent>
          </Select>
          {/* Department filter */}
          <Select
            onValueChange={onDepartmentFilterChange}
            value={DepartmentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกแผนก</SelectItem>
              {allDepartments.map((Department) => (
                <SelectItem key={Department.id} value={Department.id}>
                  {Department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* New filter for My Orders / All Orders */}
            <Select
              onValueChange={(value) => onShowUserOrdersOnlyChange(value === "my")}
              value={showUserOrdersOnly ? "my" : "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ประเภทคำสั่งซื้อ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my">รายการของฉัน</SelectItem>
                <SelectItem
                  value="all"
                >
                  รายการทั้งหมด
                </SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={onShowClassroomSummary}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              สรุปเค้กแต่ละห้อง
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSearchActionBar;
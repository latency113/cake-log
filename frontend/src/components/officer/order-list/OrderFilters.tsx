import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "pending" | "complete" | "approved";
  setStatusFilter: (
    status: "all" | "pending" | "complete" | "approved"
  ) => void;
  selectedDepartmentId: string | "all";
  setSelectedDepartmentId: (id: string | "all") => void;
  allDepartments: any[];
  selectedPickupDate: string | "all";
  setSelectedPickupDate: (date: string | "all") => void;
  availablePickupDates: string[];
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedDepartmentId,
  setSelectedDepartmentId,
  allDepartments,
  selectedPickupDate,
  setSelectedPickupDate,
  availablePickupDates,
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "all":
        return "สถานะทั้งหมด";
      case "approved":
        return "พร้อมจัดส่ง";
      case "complete":
        return "ส่งมอบเรียบร้อย";
      default:
        return "สถานะทั้งหมด";
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ค้นหาด้วยเลขที่..."
          value={searchQuery}
          maxLength={4}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          className="pl-10 shadow-sm"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-[180px] justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {selectedPickupDate === "all"
                ? "วันรับทั้งหมด"
                : formatDate(selectedPickupDate)}
            </span>
            <svg
              className="h-4 w-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          <DropdownMenuLabel>กรองตามวันรับ</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSelectedPickupDate("all")}>
            วันรับทั้งหมด
          </DropdownMenuItem>
          {availablePickupDates.map((date) => (
            <DropdownMenuItem
              key={date}
              onClick={() => setSelectedPickupDate(date)}
            >
              {formatDate(date)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-[180px] justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {getStatusLabel(statusFilter)}
            </span>
            <svg
              className="h-4 w-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          <DropdownMenuLabel>กรองตามสถานะ</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStatusFilter("all")}>
            สถานะทั้งหมด
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
            พร้อมจัดส่ง
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("complete")}>
            ส่งมอบเรียบร้อย
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>



      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-[200px] justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {selectedDepartmentId === "all"
                ? "แผนกทั้งหมด"
                : allDepartments.find((dep) => dep.id === selectedDepartmentId)
                    ?.name || "เลือกแผนก"}
            </span>
            <svg
              className="h-4 w-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>กรองตามแผนก</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSelectedDepartmentId("all")}>
            แผนกทั้งหมด
          </DropdownMenuItem>
          {allDepartments.map((dep) => (
            <DropdownMenuItem
              key={dep.id}
              onClick={() => setSelectedDepartmentId(dep.id)}
            >
              {dep.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default OrderFilters;





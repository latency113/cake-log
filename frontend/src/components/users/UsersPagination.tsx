import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface UsersPaginationProps {
  totalUsers: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const UsersPagination: React.FC<UsersPaginationProps> = ({
  totalUsers,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));
  const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalUsers);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div key={`${currentPage}-${itemsPerPage}`} className="bg-muted px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center text-sm text-foreground">
          <span>แสดง</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mx-2 px-2 py-1 h-auto text-sm cursor-pointer">
                {itemsPerPage >= 9999 ? "แสดงทั้งหมด" : `${itemsPerPage} รายการต่อหน้า`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 25, 50, 100].map((pageSize) => (
                <DropdownMenuItem
                  key={pageSize}
                  onSelect={() => onItemsPerPageChange(pageSize)}
                  className={`cursor-pointer ${pageSize === itemsPerPage ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                >
                  {pageSize} รายการต่อหน้า
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onSelect={() => onItemsPerPageChange(9999)}
                className={`cursor-pointer ${itemsPerPage >= 9999 ? "bg-accent text-accent-foreground font-semibold" : ""}`}
              >
                แสดงทั้งหมด
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="ml-2 font-medium">
            {totalUsers === 0
              ? "0 รายการ"
              : `${startItem}-${endItem} จาก ${totalUsers} รายการ`}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 border border-input rounded-md text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ก่อนหน้า
          </button>
          <div className="flex space-x-1">
            {pageNumbers.map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
                  page === currentPage
                    ? "bg-purple-600 text-white font-medium"
                    : "border border-input text-foreground hover:bg-secondary"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 border border-input rounded-md text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPagination;

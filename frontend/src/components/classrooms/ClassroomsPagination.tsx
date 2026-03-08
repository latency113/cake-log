import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";

interface ClassroomsPaginationProps {
  totalClassrooms: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
}

const ClassroomsPagination: React.FC<ClassroomsPaginationProps> = ({
  totalClassrooms,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}) => {
  if (totalClassrooms === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalClassrooms / itemsPerPage);
  const showPageNumbers = totalPages > 1 && itemsPerPage !== totalClassrooms;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalClassrooms);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={`bg-muted px-6 py-4 border-t border-border ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-foreground">
          <span>แสดง</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mx-2 px-2 py-1 h-auto text-sm">
                {itemsPerPage} รายการต่อหน้า
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 25, 50, 100, totalClassrooms > 100 ? totalClassrooms : 0].filter(Boolean).map((pageSize) => (
                <DropdownMenuItem
                  key={pageSize}
                  onSelect={() => onItemsPerPageChange(pageSize)}
                  className={pageSize === itemsPerPage ? "bg-accent text-accent-foreground" : ""}
                >
                  {pageSize === totalClassrooms ? "ทั้งหมด" : `${pageSize} รายการต่อหน้า`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="ml-4 font-medium">
            {startItem}-{endItem} จาก {totalClassrooms} รายการ
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || !showPageNumbers}
            className="px-3 py-1 border border-input rounded-md text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>
          {showPageNumbers && (
            <div className="flex space-x-1">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-input text-foreground hover:bg-secondary"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || !showPageNumbers}
            className="px-3 py-1 border border-input rounded-md text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomsPagination;

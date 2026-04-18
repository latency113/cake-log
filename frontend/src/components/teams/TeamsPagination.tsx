import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";

interface TeamsPaginationProps {
  totalTeams: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
}

const TeamsPagination: React.FC<TeamsPaginationProps> = ({
  totalTeams,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}) => {
  if (totalTeams === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalTeams / itemsPerPage);
  const showPageNumbers = totalPages > 1 && itemsPerPage !== totalTeams;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalTeams);

  // Limit the number of page buttons shown
  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className={`bg-muted px-6 py-4 border-t border-border ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center text-sm text-foreground">
          <span>แสดง</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mx-2 px-2 py-1 h-auto text-sm">
                {itemsPerPage} รายการต่อหน้า
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 25, 50, 100].map((pageSize) => (
                <DropdownMenuItem
                  key={pageSize}
                  onSelect={() => onItemsPerPageChange(pageSize)}
                  className={pageSize === itemsPerPage ? "bg-accent text-accent-foreground" : ""}
                >
                  {pageSize} รายการต่อหน้า
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="ml-4 font-medium">
            {startItem}-{endItem} จาก {totalTeams} รายการ
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-input rounded-md text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>
          <div className="hidden sm:flex space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={typeof page !== "number"}
                className={`px-3 py-1 rounded-md text-sm ${
                  page === currentPage
                    ? "bg-purple-600 text-white"
                    : page === "..."
                    ? "cursor-default"
                    : "border border-input text-foreground hover:bg-secondary"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-input rounded-md text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamsPagination;

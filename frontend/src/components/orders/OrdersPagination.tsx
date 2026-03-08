import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";

interface OrdersPaginationProps {
  totalOrders: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const OrdersPagination: React.FC<OrdersPaginationProps> = ({
  totalOrders,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  if (totalOrders === 0) return null;

  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalOrders);

  const maxVisiblePages = 5; // Max number of page buttons to show (excluding ellipsis)

  const generateVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const uniquePageNumbers = new Set<number>();

    // Always add the first and last page
    uniquePageNumbers.add(1);
    uniquePageNumbers.add(totalPages);

    // Add pages around the current page
    const delta = Math.floor((maxVisiblePages - 1) / 2); // Pages to show on either side of current
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) { // Only add if not first or last page
        uniquePageNumbers.add(i);
      }
    }

    const sortedUniquePages = Array.from(uniquePageNumbers).sort((a, b) => a - b);
    const result: (number | string)[] = [];
    let lastPageAdded: number | string | undefined = undefined;

    for (const pageNum of sortedUniquePages) {
      if (lastPageAdded !== undefined && typeof lastPageAdded === 'number' && pageNum > lastPageAdded + 1) {
        result.push("...");
      }
      result.push(pageNum);
      lastPageAdded = pageNum;
    }
    return result;
  };

  const visiblePageNumbers = generateVisiblePageNumbers();

  return (
    <div className="bg-muted px-6 py-4 border-t border-border">
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
            {startItem}-{endItem} จาก {totalOrders} รายการ
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
          <div className="flex space-x-1">
            {visiblePageNumbers.map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-foreground">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-input text-foreground hover:bg-secondary"
                  }`}
                >
                  {page}
                </button>
              )
            )}
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

export default OrdersPagination;
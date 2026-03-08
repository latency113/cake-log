import React, { useState, useMemo } from "react";
import { Role } from "../../types/common"; // Import Role
import type { Order, OrderItem, User } from "../../types"; // Import User type
import { ArrowUp, Pencil, Trash2 } from "lucide-react"; // Import Trash2 for delete icon
import OrderDetailModal from "./OrderDetailModal";
// Removed unused import: import OrderEditModal from "./OrderEditModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface OrdersTableProps {
  orders: (Order & { departmentName?: string; teamName?: string })[];
  // isViewOnly?: boolean; // Removed isViewOnly from props interface
  onUpdateStatus?: (
    orderId: string,
    newStatus: string,
    oldStatus: string
  ) => void;
  onRowClick?: (order: Order & { departmentName?: string }) => void; // New prop
  onDeleteOrder?: (orderId: string) => void; // New prop for deleting a single order
  onEditOrder?: (order: Order) => void; // New prop for editing an order
  showActions?: boolean; // New prop to control visibility of edit/delete actions
  currentUser?: User | null; // New prop for the current user
}

interface SortableHeaderProps {
  column: string;
  currentSortColumn: string | null;
  currentSortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  children: React.ReactNode;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  column,
  currentSortColumn,
  currentSortDirection,
  onSort,
  children,
}) => {
  const isSorted = currentSortColumn === column;
  const isDescending = isSorted && currentSortDirection === "desc";

  return (
    <TableHead
      className="py-4 px-6 text-left text-xs font-bold text-foreground uppercase tracking-wider cursor-pointer"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUp
          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
            isSorted && isDescending ? "rotate-180" : ""
          }`}
        />
      </div>
    </TableHead>
  );
};

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  // isViewOnly, // Removed isViewOnly from destructuring
  onRowClick,
  onDeleteOrder,
  onEditOrder, // Destructure new prop
  showActions = true, // Default to true if not provided
  currentUser, // Destructure new prop
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedOrder, setSelectedOrder] = useState<
    (Order & { departmentName?: string }) | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(-1); // New state for current order index
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false); // No longer needed as edit modal is managed by parent

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (order: Order & { departmentName?: string }) => {
    if (onRowClick) {
      onRowClick(order);
    } else {
      // Fallback behavior if onRowClick is not provided (e.g., for pages that use this directly)
      const index = sortedOrders.findIndex((o) => o.id === order.id); // Find index in sortedOrders
      setSelectedOrder(order);
      setCurrentOrderIndex(index); // Set the current order index
      setIsDetailModalOpen(true);
    }
  };

  const handleEditClick = (
    e: React.MouseEvent,
    order: Order & { departmentName?: string }
  ) => {
    e.stopPropagation();
    if (onEditOrder) {
      onEditOrder(order);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    setCurrentOrderIndex(-1); // Reset index on close
  };

  const handleNavigateOrder = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < sortedOrders.length) {
      setSelectedOrder(sortedOrders[newIndex]);
      setCurrentOrderIndex(newIndex);
    }
  };

  // const handleCloseEditModal = () => { // No longer needed as edit modal is managed by parent
  //   setIsEditModalOpen(false);
  //   setSelectedOrder(null);
  // };

  const sortedOrders = useMemo(() => {
    if (!sortColumn) {
      return orders;
    }

    const sorted = [...orders].sort((a, b) => {
      const aValue = a[sortColumn as keyof Order];
      const bValue = b[sortColumn as keyof Order];

      // Handle numeric sorting for book number
      if (sortColumn === "book_number" || sortColumn === "number") {
        const valA = sortColumn === "book_number" ? (a.book?.bookNumber || a.book_id) : aValue;
        const valB = sortColumn === "book_number" ? (b.book?.bookNumber || b.book_id) : bValue;
        const numA = parseInt(String(valA || 0), 10);
        const numB = parseInt(String(valB || 0), 10);
        if (sortDirection === "asc") {
          return numA - numB;
        } else {
          return numB - numA;
        }
      }

      // Default string comparison for other columns
      const aStr = String(aValue || ""); // Treat undefined/null as empty string
      const bStr = String(bValue || ""); // Treat undefined/null as empty string

      if (aStr < bStr) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [orders, sortColumn, sortDirection]);

  return (
    <div className="bg-card shadow-md border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
          รายการคำสั่งซื้อ
          <span className="ml-auto text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {orders.length} รายการ
          </span>
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-3">
            ไม่มีคำสั่งซื้อในขณะนี้
          </h3>
          <p className="text-muted-foreground text-lg mb-6">
            เพิ่มคำสั่งซื้อแรกของคุณ
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                column="book_number"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              >
                เล่มที่
              </SortableHeader>
              <SortableHeader
                column="number"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              >
                เลขที่
              </SortableHeader>
              <TableHead className="py-2 px-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                ข้อมูลลูกค้า
              </TableHead>
              <TableHead className="py-2 px-4 text-right text-xs font-bold text-foreground uppercase tracking-wider truncate">
                ยอดมัดจำ
              </TableHead>
              <TableHead className="py-2 px-4 text-right text-xs font-bold text-foreground uppercase tracking-wider truncate">
                ยอดรวม
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider truncate">
                ทีม
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                กำหนดวันรับเค้ก
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                วันที่รับเค้ก
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider truncate">
                ครูที่ปรึกษา
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                แผนก
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                สถานะ
              </TableHead>

              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                ผู้บันทึก
              </TableHead>
              <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                วันที่บันทึก
              </TableHead>
              {showActions &&
                (onEditOrder || onDeleteOrder) && ( // Conditionally show "Actions" header if any action is enabled
                  <TableHead className="py-2 px-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">
                    การจัดการ
                  </TableHead>
                )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow
                key={order.id}
                className={`hover:bg-muted transition-colors duration-200 cursor-pointer`} // Always clickable for detail
                onClick={() => handleRowClick(order)} // Always call handleRowClick
              >
                <TableCell className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="inline-flex items-center px-3 py-1 justify-center text-blue-500 font-bold text-sm">
                      {order.book?.bookNumber || order.book_id}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-foreground">
                      {order.number}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {order.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <span className="text-sm font-bold text-yellow-500">
                    {order.deposit.toLocaleString("th-TH")}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <span className="text-sm font-bold text-emerald-600">
                    ฿
                    {(
                      (order.totalPrice ?? 0) -
                      order.order_items.reduce(
                        (total: number, item: OrderItem) =>
                          total + item.pound * item.quantity * 10,
                        0
                      )
                    ).toLocaleString("th-TH")}{" "}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <div className="flex flex-col items-center text-right">
                    {/* ส่วนที่ 1: ชื่อทีมหรือข้อความเริ่มต้น */}
                    <span className="text-sm font-bold">
                      {order.teamName || "ไม่แข่งขัน"}
                    </span>

                    {/* ส่วนที่ 2: แสดงประเภทเฉพาะเมื่อมี team.type เท่านั้น */}
                    {order.teamType && (
                      <span className="text-xs text-muted-foreground">
                        {order.teamType === "team"
                          ? "(ทีม)"
                          : order.teamType === "person"
                          ? "(บุคคล)"
                          : ""}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-foreground">
                      {new Date(order.pickup_date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.pickup_date).toLocaleDateString("th-Th", {
                        weekday: "long",
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  {order.picked_up_at && !isNaN(new Date(order.picked_up_at).getTime()) ? (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(order.picked_up_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.picked_up_at).toLocaleDateString("th-Th", {
                          weekday: "long",
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">ยังไม่ได้รับ</span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="text-sm font-medium text-foreground truncate">
                    {order.advisor}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {order.departmentName}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium truncate ${
                      order.status === "pending"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : order.status === "approved"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        order.status === "pending"
                          ? "bg-blue-500"
                          : order.status === "approved"
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    {order.status === "pending"
                      ? "อยู่ระหว่างดำเนินการ"
                      : order.status === "approved"
                      ? "เตรียมเค้กเสร็จสิ้น"
                      : "เสร็จสิ้น"}
                  </span>
                </TableCell>

                <TableCell className="py-3 px-4 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {order.user
                      ? `${order.user.firstname} ${order.user.lastname}`
                      : "N/A"}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-foreground">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </TableCell>
                {showActions &&
                  (onEditOrder || onDeleteOrder) && ( // Conditionally show action buttons
                    <TableCell className="py-3 px-4 text-center">
                      {(() => {
                        const isAdmin =
                          currentUser?.role === Role.ADMIN ||
                          currentUser?.role === Role.SUPERADMIN;
                        const isFinalized = order.classroom?.isOrderFinalized;
                        const canPerformAction =
                          (isAdmin ||
                            (order.user_id === currentUser?.id &&
                              order.status !== "approved" && !isFinalized)) &&
                          order.status !== "complete";

                        return (
                          <div className="flex items-center justify-center space-x-2">
                            {onEditOrder && canPerformAction && (
                              <button
                                className="flex p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors duration-200 group"
                                onClick={(e) => handleEditClick(e, order)}
                              >
                                <Pencil className="w-4 h-4" />
                                <span className="text-xs"> แก้ไข</span>
                              </button>
                            )}
                            {onDeleteOrder && canPerformAction && (
                              <button
                                className="flex p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
                                onClick={(e) => handleDeleteClick(e, order.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs"> ลบ</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isDetailModalOpen && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleCloseDetailModal}
          orderList={sortedOrders} // Pass the sorted list of orders
          currentOrderIndex={currentOrderIndex} // Pass the current order's index
          onNavigate={handleNavigateOrder} // Pass the navigation handler
        />
      )}
    </div>
  );
};

export default OrdersTable;

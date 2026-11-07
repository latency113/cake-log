import React from "react";
import { Edit, Trash2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderBook } from "@/types/orderBook";
import { Badge } from "@/components/ui/badge";

interface OrderBookTableProps {
  orderBooks: OrderBook[];
  onEdit: (orderBook: OrderBook) => void;
  onDelete: (orderBook: OrderBook) => void;
  onUnassign: (orderBook: OrderBook) => void;
}

const OrderBookTable: React.FC<OrderBookTableProps> = ({
  orderBooks,
  onEdit,
  onDelete,
  onUnassign,
}) => {
  return (
    <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                เลขเล่ม
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ช่วงเลขที่
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                จำนวนที่ใช้ไป
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ความจุสูงสุด
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                เจ้าของสมุด
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {orderBooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                  ไม่พบข้อมูลสมุดจอง
                </td>
              </tr>
            ) : (
              orderBooks.map((book) => (
                <tr key={book.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {book.bookNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {book.startNumber} - {book.endNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {book.currentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {book.maxCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={book.isClosed ? "secondary" : "default"}
                      className={
                        book.isClosed
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                          : "bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800"
                      }
                    >
                      {book.isClosed ? "ปิดแล้ว" : "เปิดใช้งาน"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {book.classroom ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {book.classroom.department?.name || "ไม่ระบุแผนก"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {book.classroom.grade_level?.level === "VOCATIONAL"
                            ? "ปวช."
                            : "ปวส."}{" "}
                          {book.classroom.grade_level?.year} ห้อง{" "}
                          {book.classroom.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">
                        ยังไม่ถูกเลือก
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(book)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                        title="แก้ไข"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {book.classroom_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUnassign(book)}
                          className="text-orange-600 hover:text-orange-900 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                          title="ยกเลิกเจ้าของ"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(book)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-950/50"
                        title="ลบ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBookTable;


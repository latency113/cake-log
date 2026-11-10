import React from "react";
import { Edit, Trash2, UserX, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderBook } from "@/types/orderBook";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export const isBookUnbooked = (book: OrderBook) => {
  const hasOrders = (book.orders && book.orders.length > 0) || book.currentNumber > 0;
  const isFinalized = Boolean(book.classroom?.isOrderFinalized);
  return !hasOrders && !isFinalized;
};

export const isBookUnbookedAndOpen = isBookUnbooked;

interface OrderBookTableProps {
  orderBooks: OrderBook[];
  selectedBookIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onEdit: (orderBook: OrderBook) => void;
  onDelete: (orderBook: OrderBook) => void;
  onUnassign: (orderBook: OrderBook) => void;
  onToggleFinalize: (orderBook: OrderBook) => void;
}

const OrderBookTable: React.FC<OrderBookTableProps> = ({
  orderBooks,
  selectedBookIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onUnassign,
  onToggleFinalize,
}) => {
  const eligibleBooks = orderBooks.filter(isBookUnbookedAndOpen);
  const isAllSelected =
    eligibleBooks.length > 0 &&
    eligibleBooks.every((b) => selectedBookIds.includes(b.id));
  const isSomeSelected =
    eligibleBooks.some((b) => selectedBookIds.includes(b.id)) && !isAllSelected;

  return (
    <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3 text-center">
                <Checkbox
                  checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                  disabled={eligibleBooks.length === 0}
                  onCheckedChange={() => onToggleSelectAll && onToggleSelectAll()}
                  aria-label="เลือกทั้งหมดที่ไม่มีการจอง"
                  title={
                    eligibleBooks.length === 0
                      ? "ไม่มีสมุดจองที่สามารถปิดได้ในหน้านี้"
                      : isAllSelected
                      ? "ยกเลิกการเลือกทั้งหมด"
                      : "เลือกสมุดที่ไม่มีการจองทั้งหมดในหน้านี้"
                  }
                />
              </th>
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
                <td colSpan={8} className="px-6 py-4 text-center text-muted-foreground">
                  ไม่พบข้อมูลสมุดจอง
                </td>
              </tr>
            ) : (
              orderBooks.map((book) => {
                const isEligible = isBookUnbookedAndOpen(book);
                const isChecked = selectedBookIds.includes(book.id);

                return (
                  <tr
                    key={book.id}
                    className={`transition-colors ${
                      isChecked
                        ? "bg-amber-50/60 dark:bg-amber-950/20"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <td className="w-12 px-4 py-4 whitespace-nowrap text-center">
                      {isEligible ? (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onToggleSelect && onToggleSelect(book.id)}
                          aria-label={`เลือกสมุดเล่มที่ ${book.bookNumber}`}
                        />
                      ) : (
                        <span
                          className="inline-block"
                          title={
                            book.classroom?.isOrderFinalized
                              ? "ห้องเรียนสรุปยอดเค้กแล้ว ไม่สามารถเปิด/ปิดเล่มได้"
                              : "สมุดเล่มนี้มีการจองแล้ว ไม่สามารถเปิด/ปิดแบบกลุ่มได้"
                          }
                        >
                          <Checkbox
                            disabled
                            checked={false}
                            className="opacity-30 cursor-not-allowed"
                          />
                        </span>
                      )}
                    </td>
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
                      <div className="flex flex-col gap-1 items-start">
                        {book.classroom?.isOrderFinalized && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 font-medium"
                          >
                            <Lock className="w-3 h-3" />
                            สรุปยอดแล้ว
                          </Badge>
                        )}
                        {book.isClosed ? (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1 font-medium"
                          >
                            <Lock className="w-3 h-3" />
                            ปิดเล่ม
                          </Badge>
                        ) : !book.classroom?.isOrderFinalized ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800 font-medium"
                          >
                            เปิดใช้งาน
                          </Badge>
                        ) : null}
                      </div>
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
                            onClick={() => onToggleFinalize(book)}
                            className={
                              book.classroom?.isOrderFinalized
                                ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                : "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            }
                            title={
                              book.classroom?.isOrderFinalized
                                ? "ปรับสถานะ: ปลดล็อกสรุปยอด"
                                : "ปรับสถานะ: สรุปยอด"
                            }
                          >
                            {book.classroom?.isOrderFinalized ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {book.classroom_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={Boolean(book.classroom?.isOrderFinalized)}
                            onClick={() => onUnassign(book)}
                            className={
                              book.classroom?.isOrderFinalized
                                ? "text-muted-foreground opacity-30 cursor-not-allowed"
                                : "text-orange-600 hover:text-orange-900 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                            }
                            title={
                              book.classroom?.isOrderFinalized
                                ? "ห้องเรียนสรุปยอดแล้ว ไม่สามารถยกเลิกเจ้าของได้"
                                : "ยกเลิกเจ้าของ"
                            }
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={Boolean(book.classroom?.isOrderFinalized)}
                          onClick={() => onDelete(book)}
                          className={
                            book.classroom?.isOrderFinalized
                              ? "text-muted-foreground opacity-30 cursor-not-allowed"
                              : "text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-950/50"
                          }
                          title={
                            book.classroom?.isOrderFinalized
                              ? "ห้องเรียนสรุปยอดแล้ว ไม่สามารถลบได้"
                              : "ลบ"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBookTable;


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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เลขเล่ม
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ช่วงเลขที่
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                จำนวนที่ใช้ไป
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ความจุสูงสุด
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เจ้าของสมุด
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderBooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลสมุดจอง
                </td>
              </tr>
            ) : (
              orderBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {book.bookNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.startNumber} - {book.endNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.currentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.maxCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={book.isClosed ? "secondary" : "default"}
                      className={
                        book.isClosed
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {book.isClosed ? "ปิดแล้ว" : "เปิดใช้งาน"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.classroom ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {book.classroom.department?.name || "ไม่ระบุแผนก"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {book.classroom.grade_level?.level === "VOCATIONAL"
                            ? "ปวช."
                            : "ปวส."}{" "}
                          {book.classroom.grade_level?.year} ห้อง{" "}
                          {book.classroom.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
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
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        title="แก้ไข"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {book.classroom_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUnassign(book)}
                          className="text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                          title="ยกเลิกเจ้าของ"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(book)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
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


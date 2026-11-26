import React, { useEffect, useState, useCallback } from "react";
import { History, Search } from "lucide-react";
import { getAllOrderEditLogs } from "../../utils/api/orders";
import type { OrderEditLog } from "../../types/order";
import { ORDER_FIELD_LABELS, formatLogValue } from "../../utils/orderLogLabels";
import { Input } from "../../components/ui/input";
import OrdersPagination from "../../components/orders/OrdersPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const OrderLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<OrderEditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrderEditLogs(page, itemsPerPage, debouncedSearch || undefined);
      setLogs(res.data || []);
      setTotal(res.meta_data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch order edit logs:", err);
      setError("ไม่สามารถโหลดประวัติการแก้ไขออเดอร์ได้");
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="max-w-11/12 mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 mt-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-blue-600" />
            ประวัติการแก้ไขออเดอร์
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            ตรวจสอบผู้แก้ไข เวลา และรายการฟิลด์ที่เปลี่ยนแปลงทั้งหมด ({total.toLocaleString("th-TH")} รายการ)
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ออเดอร์, ชื่อลูกค้า, ผู้แก้ไข..."
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">วัน-เวลาที่แก้ไข</TableHead>
              <TableHead className="w-36">เล่ม / เลขที่</TableHead>
              <TableHead className="w-48">ชื่อลูกค้า</TableHead>
              <TableHead className="w-44">ผู้แก้ไข</TableHead>
              <TableHead>รายละเอียดการเปลี่ยนแปลง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  ไม่พบประวัติการแก้ไข
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="align-top">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {log.order?.book?.bookNumber
                      ? `เล่ม ${log.order.book.bookNumber} / ${log.order.number}`
                      : log.order?.number || log.order_id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.order?.customerName || "-"}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {log.edited_by
                      ? `${log.edited_by.firstname} ${log.edited_by.lastname}`
                      : log.edited_by_id}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-xs">
                      {Object.entries(log.changes || {}).map(([field, diff]) => (
                        <li key={field}>
                          <span className="font-semibold text-foreground">
                            {ORDER_FIELD_LABELS[field] || field}:
                          </span>{" "}
                          <span className="line-through text-muted-foreground">
                            {formatLogValue(field, diff?.from)}
                          </span>{" "}
                          →{" "}
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {formatLogValue(field, diff?.to)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <OrdersPagination
          totalOrders={total}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default OrderLogsPage;

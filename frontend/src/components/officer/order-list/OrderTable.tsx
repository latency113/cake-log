import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, Package } from "lucide-react";
import { getTimelineSteps } from "../../../utils/orderTimeline";
import type { Order, User } from "../../../types"; // Import User type
import useAllUsers from "../../../hooks/useAllUsers"; // Import the new hook


interface OrderTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onViewDetails }) => {
  const { users: allUsers, loading: allUsersLoading } = useAllUsers();


  const filteredOrders = orders.filter(
    (order) =>
      order.status === "approved" || order.status === "complete"
  );

  const getOfficerDisplayName = (officer: string | User | null | undefined, allUsers: User[], allUsersLoading: boolean, fallbackMessage: string) => {
    if (allUsersLoading) return "กำลังโหลดผู้ใช้...";

    if (officer === null || officer === undefined) {
      return fallbackMessage;
    }

    if (typeof officer === 'string') {
      const foundUser = allUsers.find(u => u.id === officer);
      return foundUser ? `${foundUser.firstname} ${foundUser.lastname}` : fallbackMessage;
    } else if (typeof officer === 'object') { // officer is a User object
      const firstName = officer.firstname ?? '';
      const lastName = officer.lastname ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || fallbackMessage;
    }
    return fallbackMessage;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-card">
        <CardTitle className="flex items-center justify-between">
          <span className="text-muted-foreground">รายการออเดอร์</span>
          <Badge variant="outline" className="text-sm">
            {filteredOrders.length} รายการ
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>ไม่พบรายการออเดอร์</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-muted-foreground">
                  <TableHead className="font-semibold">เลขที่</TableHead>
                  <TableHead className="font-semibold">ชื่อลูกค้า</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    เบอร์โทร
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    แผนก
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    ยอดเงิน
                  </TableHead>
                  <TableHead className="font-semibold">สถานะ</TableHead>
                  <TableHead className="font-semibold lg:table-cell">
                    ผู้จัดเตรียม
                  </TableHead>
                  <TableHead className="font-semibold lg:table-cell">
                    ผู้จ่ายเค้ก
                  </TableHead>
                  <TableHead className="font-semibold text-center">กำหนดวันรับเค้ก</TableHead>
                  <TableHead className="font-semibold text-center">วันที่รับเค้ก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted transition-colors"
                      onClick={() => onViewDetails(order)}
                    >
                      <TableCell className="font-medium text-blue-600">
                        {order.number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {order.phone}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-primary">
                          {order.departmentName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center gap-1 font-medium text-green-600">
                          ฿{order.totalPrice.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const timelineSteps = getTimelineSteps(order);
                          const currentStep = timelineSteps.find(step => step.active);
                          
                          if (!currentStep) return null;

                          return (
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${currentStep.color} ${currentStep.borderColor} text-white`}
                            >
                              {currentStep.icon}
                              {currentStep.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-muted-foreground lg:table-cell">
                        {getOfficerDisplayName(order.officer_prepare || order.officer_prepare_id, allUsers, allUsersLoading, "ยังไม่มีผู้จัดเตรียม")}
                      </TableCell>
                      <TableCell className="text-muted-foreground lg:table-cell">
                        {getOfficerDisplayName(order.officer_pickup || order.officer_pickup_id, allUsers, allUsersLoading, "ยังไม่มีผู้จ่ายเค้ก")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                          <div className="flex flex-col justify-center items-center">
                            <span>
                              {new Date(order.pickup_date).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {order.picked_up_at && !isNaN(new Date(order.picked_up_at).getTime()) ? (
                          <div className="flex flex-col justify-center items-center">
                            <span>
                              {new Date(order.picked_up_at).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.picked_up_at).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">ยังไม่ได้รับ</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTable;

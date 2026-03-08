import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, Clock } from "lucide-react";

interface OrderStatsProps {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}

const OrderStats: React.FC<OrderStatsProps> = ({
  totalOrders,
  completedOrders,
  pendingOrders,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ทั้งหมด (พร้อมจัดส่ง + ส่งมอบเรียบร้อ)</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {totalOrders}
              </p>
            </div>
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ส่งมอบเรียบร้อ</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {completedOrders}
              </p>
            </div>
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">พร้อมจัดส่ง</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {pendingOrders}
              </p>
            </div>
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;

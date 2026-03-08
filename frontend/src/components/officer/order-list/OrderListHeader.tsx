import { Package } from "lucide-react";

const OrderListHeader = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
        <Package className="h-8 w-8 text-blue-600" />
        จัดการออเดอร์
      </h1>
      <p className="text-muted-foreground mt-1">
        ระบบจัดการคำสั่งซื้อสำหรับฝ่ายจ่ายเค้ก
      </p>
    </div>
  );
};

export default OrderListHeader;

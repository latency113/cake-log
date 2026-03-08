import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface SearchedOrderCardProps {
  order: any;
  onViewDetails: (order: any) => void;
}

const SearchedOrderCard: React.FC<SearchedOrderCardProps> = ({ order, onViewDetails }) => {
  if (!order) return null;

  return (
    <Card className="shadow-md bg-muted border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ผลการค้นหา</span>
          <Badge variant="secondary">พบ 1 รายการ</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-semibold text-lg">
            เลขที่ออเดอร์: {order.number}
          </p>
          <p className="text-muted-foreground text-lg">
            ลูกค้า: {order.customerName}
          </p>
        </div>
        <Button variant="default" size="sm" onClick={() => onViewDetails(order)}>
          <Eye className="h-4 w-4 mr-2" />
          ดูรายละเอียด
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchedOrderCard;
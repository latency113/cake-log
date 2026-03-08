import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);
ChartJS.defaults.font.family = "Noto Sans Thai";

interface OrderPoundChartProps {
  poundStats: Record<string, number>;
}

const OrderPoundChart: React.FC<OrderPoundChartProps> = ({ poundStats }) => {
  const pieChartData = {
    labels: Object.keys(poundStats),
    datasets: [
      {
        label: "จำนวนปอนด์",
        data: Object.values(poundStats),
        backgroundColor: [
          "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6",
          "#8B5CF6", "#D946EF", "#EC4899", "#6366F1", "#F97316",
          "#14B8A6", "#65A30D",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "สรุปยอดสั่งซื้อเค้ก (ปอนด์)",
        font: {
          size: 14,
          weight: 500,
        },
      },
    },
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-card">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          ยอดสั่งซื้อ (ปอนด์)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {Object.keys(poundStats).length > 0 &&
        Object.values(poundStats).some((v) => v > 0) ? (
          <div className="relative h-[400px] w-full flex items-center justify-center">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>ไม่พบข้อมูลยอดสั่งซื้อสำหรับตัวกรองที่เลือก</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderPoundChart;

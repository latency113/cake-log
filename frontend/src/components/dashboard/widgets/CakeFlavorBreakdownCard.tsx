import React from "react";
import type { ProductBreakdownItem } from "@/types/dashboard";
import { Cake, PieChart } from "lucide-react";

interface CakeFlavorBreakdownCardProps {
  productBreakdown: ProductBreakdownItem[];
}

const getFlavorStyle = (productName: string, index: number) => {
  const name = productName.toLowerCase();

  // เค้กช็อกโกแลต
  if (name.includes("ช็อก") || name.includes("ชอก") || name.includes("choco")) {
    return {
      bar: "bg-[#5D4037] dark:bg-[#795548]",
      dot: "bg-[#5D4037] dark:bg-[#795548]",
      text: "text-[#5D4037] dark:text-[#D7CCC8]",
    };
  }

  // เค้กกาแฟ
  if (name.includes("กาแฟ") || name.includes("coffee")) {
    return {
      bar: "bg-[#8D6E63] dark:bg-[#A1887F]",
      dot: "bg-[#8D6E63] dark:bg-[#A1887F]",
      text: "text-[#6D4C41] dark:text-[#D7CCC8]",
    };
  }

  // เค้กแยมผลไม้
  if (name.includes("แยม") || name.includes("ผลไม้") || name.includes("jam") || name.includes("fruit")) {
    return {
      bar: "bg-rose-500 dark:bg-rose-600",
      dot: "bg-rose-500 dark:bg-rose-600",
      text: "text-rose-600 dark:text-rose-400",
    };
  }

  // เค้กเนยสด / วานิลลา
  if (name.includes("เนย") || name.includes("วานิลลา") || name.includes("vanilla") || name.includes("butter")) {
    return {
      bar: "bg-amber-400 dark:bg-amber-500",
      dot: "bg-amber-400 dark:bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
    };
  }

  // สีสำรอง
  const fallbacks = [
    {
      bar: "bg-amber-400 dark:bg-amber-500",
      dot: "bg-amber-400 dark:bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
    },
    {
      bar: "bg-[#5D4037] dark:bg-[#795548]",
      dot: "bg-[#5D4037] dark:bg-[#795548]",
      text: "text-[#5D4037] dark:text-[#D7CCC8]",
    },
    {
      bar: "bg-rose-500 dark:bg-rose-600",
      dot: "bg-rose-500 dark:bg-rose-600",
      text: "text-rose-600 dark:text-rose-400",
    },
    {
      bar: "bg-[#8D6E63] dark:bg-[#A1887F]",
      dot: "bg-[#8D6E63] dark:bg-[#A1887F]",
      text: "text-[#6D4C41] dark:text-[#D7CCC8]",
    },
  ];

  return fallbacks[index % fallbacks.length];
};

const CakeFlavorBreakdownCard: React.FC<CakeFlavorBreakdownCardProps> = ({
  productBreakdown,
}) => {
  return (
    <div className="bg-card rounded-sm shadow-md border border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Cake className="w-4 h-4 text-purple-500" />
          สัดส่วนยอดสั่งตามรสชาติเค้ก (สำหรับวางแผนผลิต)
        </h2>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <PieChart className="w-3.5 h-3.5" />
          ยอดรวมปอนด์
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-around gap-4">
        {productBreakdown && productBreakdown.length > 0 ? (
          productBreakdown.map((item, index) => {
            const style = getFlavorStyle(item.name, index);

            return (
              <div key={item.id || index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 shadow-xs ${style.dot}`} />
                    <span className="font-semibold text-foreground truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground">
                      {item.totalPounds.toLocaleString()} ปอนด์
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 font-medium">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${style.bar}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            ยังไม่มีข้อมูลคำสั่งซื้อเค้ก
          </div>
        )}
      </div>
    </div>
  );
};

export default CakeFlavorBreakdownCard;

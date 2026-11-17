import React from "react";
import { ShoppingBag } from "lucide-react";
import type { FulfillmentStats } from "@/types/dashboard";

interface TotalOrdersCountCardProps {
  totalOrdersCount: number;
  fulfillmentStats?: FulfillmentStats;
}

const TotalOrdersCountCard: React.FC<TotalOrdersCountCardProps> = ({
  totalOrdersCount,
  fulfillmentStats,
}) => {
  return (
    <div className="bg-card rounded-sm shadow-md border border-border p-6 sm:p-8 flex items-center justify-between overflow-hidden relative group hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShoppingBag className="w-24 h-24 -mr-8 -mt-8 text-emerald-600" />
      </div>

      <div className="relative z-10">
        <p className="text-md text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          จำนวนออเดอร์ทั้งหมด
        </p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl text-foreground tracking-tight">
            {totalOrdersCount.toLocaleString()}
          </h2>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            รายการ
          </span>
        </div>
        {fulfillmentStats && (
          <p className="text-xs text-muted-foreground mt-2">
            รอรับ {fulfillmentStats.remainingPounds.toLocaleString()} ปอนด์
          </p>
        )}
      </div>

      <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
        <ShoppingBag className="w-7 h-7" />
      </div>
    </div>
  );
};

export default TotalOrdersCountCard;

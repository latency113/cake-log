import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { FulfillmentStats } from "@/types/dashboard";

interface PickupFulfillmentCardProps {
  fulfillmentStats?: FulfillmentStats;
}

const PickupFulfillmentCard: React.FC<PickupFulfillmentCardProps> = ({
  fulfillmentStats,
}) => {
  const rate = fulfillmentStats?.fulfillmentRate || 0;
  const pickedUp = fulfillmentStats?.pickedUpPounds || 0;
  const total = fulfillmentStats?.totalPounds || 0;

  return (
    <div className="bg-card rounded-sm shadow-md border border-border p-6 sm:p-8 flex items-center justify-between overflow-hidden relative group hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <CheckCircle2 className="w-24 h-24 -mr-8 -mt-8 text-indigo-600" />
      </div>

      <div className="relative z-10 w-full pr-4">
        <p className="text-md text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          ความคืบหน้าการส่งมอบ
        </p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl text-foreground tracking-tight">{rate}%</h2>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            ส่งมอบแล้ว
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {pickedUp.toLocaleString()} จาก {total.toLocaleString()} ปอนด์
        </p>
      </div>

      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
        <CheckCircle2 className="w-7 h-7" />
      </div>
    </div>
  );
};

export default PickupFulfillmentCard;

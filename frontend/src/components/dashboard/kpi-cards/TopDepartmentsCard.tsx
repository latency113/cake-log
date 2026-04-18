import React from "react";
import type { DashboardSummary } from "@/types/dashboard";
import { Award, Crown } from "lucide-react";

interface TopDepartmentsCardProps {
  topDepartments: DashboardSummary["topDepartments"];
}

const TopDepartmentsCard: React.FC<TopDepartmentsCardProps> = ({
  topDepartments,
}) => {
  const rankColors = [
    {
      badge: "bg-yellow-400 text-white",
      value: "text-yellow-500",
      row: "border border-slate-200",
    },
    {
      badge: "bg-slate-400 text-white",
      value: "text-slate-500",
      row: "border border-slate-200",
    },
    {
      badge: "bg-orange-400 text-white",
      value: "text-orange-500",
      row: "border border-slate-200",
    },
  ];

  return (
    <div className="bg-white rounded-sm shadow-md border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header — matches other card headers in the dashboard */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-500" />
          แผนกที่ซื้อมากที่สุด
        </h2>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        {topDepartments.length > 0 ? (
          topDepartments.slice(0, 3).map((dept, index) => {
            const colors = rankColors[index] ?? rankColors[2];

            return (
              <div
                key={index}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${colors.row}`}
              >
                {/* Rank badge */}
                <div className="relative flex-shrink-0">
                  {index === 0 && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-3 left-1/2 -translate-x-1/2" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colors.badge}`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Dept info + progress bar */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-wider leading-none mb-1">
                    แผนก
                  </p>
                  <p className="text-sm font-medium text-slate-700 truncate leading-tight">
                    {dept.name}
                  </p>
                </div>

                {/* Value */}
                <div className="flex-shrink-0 text-right">
                  <span
                    className={`text-xl font-semibold tabular-nums ${colors.value}`}
                  >
                    {dept.totalPounds.toLocaleString()}
                  </span>
                  <span className="ml-1 text-[10px] uppercase">
                    ปอนด์
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-2">
            <Award className="w-10 h-10 text-slate-300" />
            <p className="text-xs">ยังไม่มีข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopDepartmentsCard;

import React from "react";
import type { DashboardSummary } from "@/types/dashboard";
import { Building2, Crown, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface TopDepartmentsCardProps {
  topDepartments: DashboardSummary["topDepartments"];
}

const TopDepartmentsCard: React.FC<TopDepartmentsCardProps> = ({
  topDepartments,
}) => {
  const rankStyles = [
    {
      badge: "bg-amber-400 text-amber-950 shadow-sm",
      border: "border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20",
    },
    {
      badge: "bg-slate-300 text-slate-800",
      border: "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30",
    },
    {
      badge: "bg-amber-600 text-white",
      border: "border-amber-300/40 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10",
    },
    {
      badge: "bg-muted text-muted-foreground",
      border: "border-border bg-card/40",
    },
    {
      badge: "bg-muted text-muted-foreground",
      border: "border-border bg-card/40",
    },
  ];

  return (
    <div className="bg-card rounded-sm shadow-md border border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          อันดับแผนกที่มียอดสั่งซื้อสูงสุด
        </h2>
        <Link
          to="/dashboard/classrooms-report"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          ดูรายงานแผนก
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Body: justify-start keeps consistent spacing */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start gap-2.5">
        {topDepartments && topDepartments.length > 0 ? (
          topDepartments.slice(0, 5).map((dept, index) => {
            const style = rankStyles[index] ?? rankStyles[3];

            return (
              <div
                key={dept.name || index}
                className={`relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-colors ${style.border}`}
              >
                {/* Left: Rank & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {index === 0 && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-3 left-1/2 -translate-x-1/2" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${style.badge}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-foreground truncate">
                    {dept.name}
                  </p>
                </div>

                {/* Right: Total Pounds */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {dept.totalPounds.toLocaleString()}{" "}
                    <span className="text-xs font-medium text-muted-foreground">ปอนด์</span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            ยังไม่มีข้อมูลยอดขายของแผนก
          </div>
        )}
      </div>
    </div>
  );
};

export default TopDepartmentsCard;

import React from "react";
import type { DashboardSummary } from "@/types/dashboard";

interface TopDepartmentsCardProps {
  topDepartments: DashboardSummary["topDepartments"];
}

const TopDepartmentsCard: React.FC<TopDepartmentsCardProps> = ({ topDepartments }) => {
  return (
    <div className="bg-card rounded-sm shadow-lg border border-border p-8">
      <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center">
        <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
        แผนกที่ซื้อมากที่สุด (3 อันดับแรก)
      </h2>
      {topDepartments.length > 0 ? (
        <div className="space-y-4">
          {topDepartments.map((dept: { name: string; totalPounds: number; }, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-sm flex items-center justify-center text-white font-bold mr-4 ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                      ? "bg-gray-400"
                      : "bg-orange-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-lg font-medium text-foreground">
                  {dept.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-600">
                  {dept.totalPounds}
                </div>
                <div className="text-sm text-muted-foreground">ปอนด์</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground">ไม่มีข้อมูลแผนก</p>
        </div>
      )}
    </div>
  );
};

export default TopDepartmentsCard;

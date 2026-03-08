import React from "react";

interface TotalSummaryCardProps {
  grandTotal: number;
}

const TotalSummaryCard: React.FC<TotalSummaryCardProps> = ({ grandTotal }) => {
  return (
    <div className="mb-6 p-5 bg-card rounded-lg shadow-md border border-border">
      {/* ยอดรวมหลัก */}
      <div className="flex items-center justify-between pb-3">
        <span className="text-base font-bold text-foreground uppercase tracking-wide">
          ยอดรวมทั้งหมด
        </span>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-foreground tabular-nums">
            {grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-base font-semibold text-foreground">บาท</span>
        </div>
      </div>

      {/* เส้นแบ่ง */}
      <div className="border-t border-border"></div>

      {/* ข้อมูลเพิ่มเติม */}
      <div className="mt-4 pt-1">
        <div className="flex items-start">
          {/* Icon แจ้งเตือน */}
          <div className="flex-shrink-0 mr-3 mt-0.5">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSummaryCard;

import React from "react";

interface TotalSalesCardProps {
  totalSalesAmount: number;
}

const TotalSalesCard: React.FC<TotalSalesCardProps> = ({ totalSalesAmount }) => {
  return (
    <div className="grid bg-gradient-to-r from-blue-600 to-blue-700 rounded-sm shadow-lg p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium mb-3 text-blue-100">
            ยอดขายรวมทั้งหมด
          </h2>
          <p className="text-4xl font-bold">
            ฿{totalSalesAmount.toLocaleString("th-TH")}
          </p>
          <div className="mt-2 text-blue-200 text-sm">รวมทุกแผนก</div>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TotalSalesCard;

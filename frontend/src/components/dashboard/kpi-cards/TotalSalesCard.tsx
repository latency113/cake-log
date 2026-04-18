import React from "react";
import { Wallet } from "lucide-react";

interface TotalSalesCardProps {
  totalSalesAmount: number;
}

const TotalSalesCard: React.FC<TotalSalesCardProps> = ({ totalSalesAmount }) => {
  return (
    <div className="bg-white rounded-sm shadow-md border border-border p-6 sm:p-8 flex items-center justify-between overflow-hidden relative group hover:border-blue-200 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Wallet className="w-24 h-24 -mr-8 -mt-8 text-blue-600" />
      </div>
      
      <div className="relative z-10">
        <p className="text-md text-blue-600 uppercase tracking-wider mb-1">
          ยอดขายรวมทั้งหมด
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-blue-600">฿</span>
          <h2 className="text-4xl text-slate-800 tracking-tight">
            {totalSalesAmount.toLocaleString("th-TH")}
          </h2>
        </div>
      </div>
      
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
        <Wallet className="w-7 h-7" />
      </div>
    </div>
  );
};

export default TotalSalesCard;

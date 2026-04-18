import React from "react";
import { Cake } from "lucide-react";

interface TotalOrdersCardProps {
  totalPounds: number;
}

const TotalOrdersCard: React.FC<TotalOrdersCardProps> = ({
  totalPounds,
}) => {
  return (
    <div className="bg-white rounded-sm shadow-md border border-border p-6 sm:p-8 flex items-center justify-between overflow-hidden relative group hover:border-purple-200 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Cake className="w-24 h-24 -mr-8 -mt-8 text-purple-600" />
      </div>

      <div className="relative z-10">
        <p className="text-md text-purple-600  uppercase tracking-wider mb-1">
          จำนวนปอนด์ทั้งหมด
        </p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl text-slate-800 tracking-tight">
            {totalPounds.toLocaleString()}
          </h2>
          <span className="text-sm font-bold text-purple-600 uppercase">ปอนด์</span>
        </div>
      </div>
      
      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
        <Cake className="w-7 h-7" />
      </div>
    </div>
  );
};

export default TotalOrdersCard;

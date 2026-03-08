import React from "react";
import { Cake } from "lucide-react";

interface TotalOrdersCardProps {
  totalPounds: number;
}

const TotalOrdersCard: React.FC<TotalOrdersCardProps> = ({
  totalPounds,
}) => {
  return (
    <div className="grid bg-gradient-to-r from-purple-600 to-purple-700 rounded-sm shadow-lg p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium mb-3 text-purple-100">
            จำนวนปอนด์ทั้งหมด
          </h2>
          <p className="text-4xl font-bold">{totalPounds}</p>
          <div className="mt-2 text-purple-200 text-sm">ปอนด์</div>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Cake className="w-8 h-8"/>
        </div>
      </div>
    </div>
  );
};

export default TotalOrdersCard;

import React from "react";
import type { InputChangeEvent } from "../../../types";
import PaymentCalculationCard from "../summary/PaymentCalculationCard";
import { HandCoins } from "lucide-react";

interface SummarySectionProps {
  grandTotal: number;
  discount: number;
  netPayable: number;
  deposit: number;

  onDepositAmountChange: (e: InputChangeEvent) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  discount,
  netPayable,
  deposit,
  onDepositAmountChange,
}) => {
  return (
    <div className="p-6 bg-card rounded-sm border border-gray-200 shadow-sm mt-4">
      {/* หัวข้อส่วนสรุป */}
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-border">
        <div className="p-2 bg-blue-50 rounded-xl">
          <HandCoins className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          สรุปการชำระเงิน
        </h3>
      </div>
      {/* Grid สำหรับข้อมูลการชำระ */}
      <div className="grid grid-cols-1 gap-6">
        <PaymentCalculationCard
          discount={discount}
          netPayable={netPayable}
          deposit={deposit}
          onDepositAmountChange={onDepositAmountChange}
          remainingBalance={netPayable - deposit}
        />
      </div>
    </div>
  );
};

export default SummarySection;

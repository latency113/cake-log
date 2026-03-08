import React from "react";
import InputField from "./../../common/InputField";
import type { InputChangeEvent } from "./../../../types";
import PaymentStatusCard from "../summary/PaymentStatusCard";

interface PaymentCalculationCardProps {
  discount: number;
  netPayable: number;
  deposit: number;
  remainingBalance: number;
  onDepositAmountChange: (e: InputChangeEvent) => void;
}

const PaymentCalculationCard: React.FC<PaymentCalculationCardProps> = ({
  discount,
  netPayable,
  deposit,
  remainingBalance,
  onDepositAmountChange,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 space-y-4">
      {/* ส่วนลด */}
      <div className="p-3 bg-card border border-border shadow-sm">
        <label className="block text-sm font-semibold text-foreground mb-2">
          ส่วนลด (10%)
        </label>
        <div className="relative">
          <div className="w-full p-2 text-right border border-border rounded-md bg-muted text-foreground font-medium">
            - {discount.toLocaleString()} บาท
          </div>
        </div>
      </div>

      {/* สุทธิที่จ่าย */}
      <div className="p-3 bg-card border border-input shadow-sm">
        <label className="block text-sm font-semibold text-foreground mb-2">
          จำนวนเงินสุทธิที่ต้องชำระ
        </label>
        <div className="relative">
          <div className="w-full p-2 text-right border-2 border-input rounded-md bg-muted text-foreground font-bold text-md">
            {netPayable.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
            บาท
          </div>
        </div>
      </div>

      {/* ยอดเงินมัดจำ */}
      <div className="p-3 bg-card border border-border shadow-sm">
        <label className="block text-sm font-semibold text-foreground mb-2">
          ยอดเงินมัดจำ
        </label>
        <InputField
          label=""
          name="deposit"
          value={deposit.toString()}
          onChange={onDepositAmountChange}
          type="number"
          placeholder="0.00"
          inputClassName="w-full p-2 text-right border border-input rounded-md bg-card text-foreground font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
        />
        <div className="flex-1">
          <p className="text-xs font-medium text-foreground leading-relaxed">
            <span className="font-semibold">หมายเหตุ:</span>{" "}
            ยอดเงินมัดจำกำหนดไว้ที่
            <span className="font-bold text-blue-700 mx-1">100 บาท</span>
            ต่อปอนด์
          </p>
        </div>
      </div>

      <PaymentStatusCard remainingBalance={remainingBalance} />
    </div>
  );
};

export default PaymentCalculationCard;

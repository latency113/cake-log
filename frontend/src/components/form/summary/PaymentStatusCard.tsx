import React from "react";

interface PaymentStatusCardProps {
  remainingBalance: number;
}

const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  remainingBalance,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-card shadow-md border border-border">
        <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
          ยอดค้างชำระสุทธิ
        </label>
        <div className="relative">
          <div
            className={`w-full p-1 text-right border-2 rounded-md font-bold text-base ${
              remainingBalance > 0
                ? "border-red-400 bg-red-50 text-red-800"
                : "border-green-400 bg-green-50 text-green-800"
            }`}
          >
            {remainingBalance > 0 ? " - " : ""}
            {Math.abs(remainingBalance).toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })}{" "}
            บาท
          </div>

          {/* Status indicator */}
          <div
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
              remainingBalance > 0 ? "bg-red-500" : "bg-green-500"
            }`}
          ></div>

        </div>

        {remainingBalance > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
              <svg
                className="w-3.5 h-3.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold">
                ยอดคงเหลือที่ต้องชำระเพิ่มเติม
              </span>
            </div>
          </div>
        )}

        {remainingBalance <= 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center text-green-700">
              <svg
                className="w-3.5 h-3.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold">
                ชำระเงินครบแล้ว
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusCard;

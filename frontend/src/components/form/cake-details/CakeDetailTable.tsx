import React from "react";
import type { CakeItem } from "../../../types";
import { calculateCakeItemTotals } from "../../../utils/calculations";
import { Package, Calculator } from "lucide-react";
import CakeTableHeader from "./CakeTableHeader";
import CakeTableRow from "./CakeTableRow";

interface CakeDetailsTableProps {
  cakeItems: CakeItem[];
  onQuantityChange: (
    cakeId: string,
    field: keyof CakeItem,
    value: number
  ) => void;
}

const CakeDetailsTable: React.FC<CakeDetailsTableProps> = ({
  cakeItems,
  onQuantityChange,
}) => {
  return (
    <div className="bg-card rounded-sm shadow-sm border border-border overflow-hidden">
      {/* Minimal Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            รายการสั่งซื้อเค้ก
          </h2>
        </div>
      </div>

      {/* Minimal Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <CakeTableHeader />

          {/* Minimal Table Body */}
          <tbody className="divide-y divide-border">
            {cakeItems.map((item, index) => (
              <CakeTableRow
                key={item.id}
                item={item}
                index={index}
                onQuantityChange={onQuantityChange}
              />
            ))}

            {/* Minimal Total Row */}
            <tr className="bg-muted border-t-2 border-border">
              <td
                colSpan={9}
                className="px-4 py-3 text-right border-r border-border"
              >
                <div className="flex items-center justify-end space-x-2">
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground ">
                    ยอดรวมทั้งสิ้น
                  </span>
                </div>
              </td>
              <td className="px-4 py-5 text-right">
                <div className="text-xl font-bold text-foreground">
                  ฿
                  {cakeItems
                    .reduce(
                      (sum, item) =>
                        calculateCakeItemTotals(item).totalAmount + sum,
                      0
                    )
                    .toLocaleString()}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CakeDetailsTable;

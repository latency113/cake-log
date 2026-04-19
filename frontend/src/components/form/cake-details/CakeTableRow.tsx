import React from "react";
import type { CakeItem } from "../../../types";
import { calculateCakeItemTotals } from "../../../utils/calculations";

interface CakeTableRowProps {
  item: CakeItem;
  index: number;
  onQuantityChange: (cakeId: string, field: keyof CakeItem, value: number) => void;
}

// สีแต่ละแถว (วนตามแนวนอน)
const rowColors = ["bg-yellow-50", "bg-green-50", "bg-blue-50", "bg-pink-50"];

const CakeTableRow: React.FC<CakeTableRowProps> = ({ item, index, onQuantityChange }) => {
  const calculatedItem = calculateCakeItemTotals(item);

  return (
    <tr
      key={item.id}
      className="hover:bg-secondary/30 transition-colors duration-150"
    >
      {/* Cake Name */}
      <td className="px-4 py-3 border-r border-border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-xs">🎂</span>
          </div>
          <div>
            <div className="font-medium text-foreground truncate">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              รายการที่ {index + 1}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-3 py-3 text-center border-r border-border">
        <div className="text-base font-semibold text-foreground">
          ฿{item.pricePerPound.toFixed(0)}
        </div>
      </td>

      {/* ✅ Quantity Inputs (สีแนวนอน) */}
      {[1, 2, 3, 4, 5].map((pound) => (
        <td
          key={`qty-${item.id}-${pound}p`}
          className={`${rowColors[index % rowColors.length]} px-1 py-1 text-center`}
        >
          <input
            type="number"
            min="0"
            max="20"
            className="w-10 h-7 text-center text-muted-foreground text-xs border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-50 transition-all duration-200"
            value={String(item[`qty${pound}Pound` as keyof CakeItem] || '')}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              let processedValue = isNaN(value) || value < 0 ? 0 : value;
              if (processedValue > 20) processedValue = 20;
              onQuantityChange(
                item.id,
                `qty${pound}Pound` as keyof CakeItem,
                processedValue
              );
            }}
          />
        </td>
      ))}

      {/* Total Pieces */}
      <td className="px-2 py-3 text-center border-r border-border">
        <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-50 rounded-full">
          <span className="text-xs font-medium text-blue-600">
            {calculatedItem.totalPieces}
          </span>
        </div>
      </td>

      {/* Total Pounds */}
      <td className="px-3 py-3 text-center border-r border-border">
        <div className="font-semibold text-foreground">
          {calculatedItem.totalPounds}
        </div>
        <div className="text-xs text-muted-foreground">ปอนด์</div>
      </td>

      {/* Total Amount */}
      <td className="px-3 py-3 text-right">
        <div className="text-base font-bold text-foreground">
          ฿{calculatedItem.totalAmount.toLocaleString()}
        </div>
      </td>
    </tr>
  );
};

export default CakeTableRow;

import React from "react";

const CakeTableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="border-b border-border">
        <th
          rowSpan={2}
          className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-r border-border"
        >
          <div className="flex items-center space-x-2">
            <span>รายการเค้ก</span>
          </div>
        </th>
        <th
          rowSpan={2}
          className="px-3 py-3 text-center text-sm font-medium text-muted-foreground border-r border-border"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="truncate">ราคา/ปอนด์</span>
          </div>
        </th>
        <th
          colSpan={6}
          className="px-3 py-3 text-center text-sm font-medium text-muted-foreground bg-secondary border-r border-border"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>จำนวนชิ้น / ขนาดปอนด์</span>
          </div>
        </th>
        <th
          rowSpan={2}
          className="px-3 py-3 text-center text-sm font-medium text-muted-foreground border-r border-border"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>รวมปอนด์</span>
          </div>
        </th>
        <th
          rowSpan={2}
          className="px-3 py-3 text-center text-sm font-medium text-muted-foreground"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="truncate">รวมเงิน</span>
          </div>
        </th>
      </tr>

      <tr className="border-b border-border">
        {[1, 2, 3, 4, 5].map((pound) => (
          <th
            key={pound}
            className="px-2 py-2 text-center bg-secondary border-r border-border"
          >
            <div className="flex items-center space-y-1">
              <div className="w-3 h-3 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                {pound}
              </div>
              <span className="flex items-center justify-center text-xs text-muted-foreground truncate">ปอนด์</span>
            </div>
          </th>
        ))}
        <th className="px-3 py-3 text-center bg-secondary border-r border-border">
          <div className="text-xs text-muted-foreground">รวมชิ้น</div>
        </th>
      </tr>
    </thead>
  );
};

export default CakeTableHeader;

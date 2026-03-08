import React from "react";
import SalesRecordsTable from "./SalesRecordsTable";
import type { DailySalesRecord } from "../../../types/dashboard";

interface PrintableSalesRecordsContentProps {
  salesRecords: DailySalesRecord[];
  productNames: string[];
  loggedInUsername?: string;
}

const PrintableSalesRecordsContent: React.FC<PrintableSalesRecordsContentProps> = ({
  salesRecords,
  productNames,
  loggedInUsername,
}) => {
  return (
    <div className="p-4">
      <SalesRecordsTable
        salesRecords={salesRecords}
        productNames={productNames}
        loggedInUsername={loggedInUsername}
      />
    </div>
  );
};

export default PrintableSalesRecordsContent;

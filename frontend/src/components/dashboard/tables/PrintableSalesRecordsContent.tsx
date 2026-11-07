import React from "react";
import SalesRecordsTable from "./SalesRecordsTable";
import type { DailySalesRecord } from "../../../types/dashboard";

interface PrintableSalesRecordsContentProps {
  salesRecords: DailySalesRecord[];
  productNames: string[];
  loggedInUsername?: string;
  academicYear?: string;
  newYear?: string;
}

const PrintableSalesRecordsContent: React.FC<PrintableSalesRecordsContentProps> = ({
  salesRecords,
  productNames,
  loggedInUsername,
  academicYear,
  newYear,
}) => {
  return (
    <div className="p-4">
      <SalesRecordsTable
        salesRecords={salesRecords}
        productNames={productNames}
        loggedInUsername={loggedInUsername}
        academicYear={academicYear}
        newYear={newYear}
      />
    </div>
  );
};

export default PrintableSalesRecordsContent;

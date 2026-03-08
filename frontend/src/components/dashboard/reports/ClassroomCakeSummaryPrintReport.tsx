// src/components/dashboard/reports/ClassroomCakeSummaryPrintReport.tsx
import React from "react";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { type ClassroomCakeSummary } from "@/types/classroomCakeSummary";
import {
  Table,
  TableBody,
} from "@/components/ui/table"; // Import Table components

interface ClassroomCakeSummaryPrintReportProps {
  summaryData: ClassroomCakeSummary[] | null;
  loading: boolean;
  error: Error | null;
  printId?: string;
}

const ClassroomCakeSummaryPrintReport: React.FC<
  ClassroomCakeSummaryPrintReportProps
> = ({ summaryData, loading, error, printId }) => {
  return (
    <div id={printId} className="print-only mt-8">
        {/* Main Table */}
      <Table className="w-full">
        <TableBody>
          {/* ClassroomCakeSummaryContent will now render rows directly */}
          <ClassroomCakeSummaryContent
            summaryData={summaryData}
            loading={loading}
            error={error}
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassroomCakeSummaryPrintReport;

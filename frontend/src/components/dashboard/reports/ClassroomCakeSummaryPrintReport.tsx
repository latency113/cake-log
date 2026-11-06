// src/components/dashboard/reports/ClassroomCakeSummaryPrintReport.tsx
import React from "react";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { type ClassroomCakeSummary } from "@/types/classroomCakeSummary";

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
    <div id={printId} className="print-only mt-4">
      <ClassroomCakeSummaryContent
        summaryData={summaryData}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default ClassroomCakeSummaryPrintReport;

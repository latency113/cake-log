import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import useDashboardData from "../../hooks/useDashboardData";
import SalesRecordsTable from "../../components/dashboard/tables/SalesRecordsTable";
import PrintableSalesRecordsContent from "../../components/dashboard/tables/PrintableSalesRecordsContent";
import { Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SalesRecordsPageSkeleton from "../../components/dashboard/skeletons/SalesRecordsPageSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import printScaleInstructionImg from "../../../public/assets/print.jpg";

const SalesRecordsPage: React.FC = () => {
  const { dashboardSummary, loading, error, consolidatedSalesRecords } =
    useDashboardData();
  const { user } = useAuth();
  const [showScaleInstruction, setShowScaleInstruction] = useState(false);

  const handlePrint = () => {
    if (!dashboardSummary || !consolidatedSalesRecords) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error("Could not get iframe document.");
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Records</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page {
            size: A4 landscape;
          }
          body {
            font-family: 'Noto Sans Thai', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
      </html>
    `);
    iframeDoc.close();

    const printRoot = iframeDoc.getElementById("print-root");
    if (printRoot) {
      const tempDiv = document.createElement("div");
      printRoot.appendChild(tempDiv);
      const root = ReactDOM.createRoot(tempDiv);
      root.render(
        <PrintableSalesRecordsContent
          salesRecords={consolidatedSalesRecords}
          productNames={dashboardSummary.allProducts.map((p) => p.name)}
          loggedInUsername={user?.username}
        />
      );

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        }, 600);
      };
    }
  };

  if (loading) {
    return <SalesRecordsPageSkeleton />;
  }

  if (error) {
    return (
      <div>
        Error:{" "}
        {typeof error === "object" && error !== null && "message" in error
          ? (error as any).message
          : String(error)}
      </div>
    );
  }

  if (!dashboardSummary || !dashboardSummary.allProducts) {
    return <div>No sales data available.</div>;
  }

  return (
    <div>
      <div className="flex gap-2 items-center">

        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          พิมพ์
        </button>
        <p className="cursor-pointer hover:text-blue-500" onClick={() => setShowScaleInstruction(true)}>*หมายเหตุ : ก่อนปริ้นปรับให้ปรับ Scale เหลือ 80 ตามภาพ</p>
      </div>
      <SalesRecordsTable
        salesRecords={consolidatedSalesRecords}
        productNames={dashboardSummary.allProducts.map((p) => p.name)}
        loggedInUsername={user?.username}
      />

      <Dialog open={showScaleInstruction} onOpenChange={setShowScaleInstruction}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>คำแนะนำการปรับ Scale การพิมพ์</DialogTitle>
            <DialogDescription>
              โปรดปรับ Scale ของการพิมพ์เป็น 80% เพื่อให้เอกสารพอดีกับหน้ากระดาษ
            </DialogDescription>
          </DialogHeader>
          <img src={printScaleInstructionImg} alt="Print Scale Instruction" className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesRecordsPage;

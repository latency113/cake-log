import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import useDashboardData from "../../hooks/useDashboardData";
import SalesRecordsTable from "../../components/dashboard/tables/SalesRecordsTable";
import PrintableSalesRecordsContent from "../../components/dashboard/tables/PrintableSalesRecordsContent";
import { Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SalesRecordsPageSkeleton from "../../components/dashboard/skeletons/SalesRecordsPageSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import printScaleInstructionImg from "../../../public/assets/print.jpg";
import { getCakeSettings } from "@/utils/api/settings";
import type { ICakeSettings } from "@/types/cake";

const SalesRecordsPage: React.FC = () => {
  const { dashboardSummary, loading, error, consolidatedSalesRecords } =
    useDashboardData();
  const { user } = useAuth();
  const [showScaleInstruction, setShowScaleInstruction] = useState(false);
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
      } catch (err) {
        console.error("Failed to load cake settings in SalesRecordsPage:", err);
      }
    };
    fetchSettings();
  }, []);

  const selectedYear =
    localStorage.getItem("academicYear") ||
    (new Date().getFullYear() + 543).toString();

  const currentAcademicYear = cakeSettings?.academicYear || selectedYear;
  const currentNewYear =
    cakeSettings?.currentYear ||
    (parseInt(currentAcademicYear) + 1).toString();

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
            margin: 5mm;
          }
          @media print {
            html, body {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              zoom: 0.8 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          body {
            font-family: 'Noto Sans Thai', sans-serif;
            margin: 0;
            padding: 0;
            zoom: 0.8;
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
          academicYear={currentAcademicYear}
          newYear={currentNewYear}
        />
      );

      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print error:", e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }
      };

      iframe.onload = () => {
        setTimeout(triggerPrint, 300);
      };
      // Fallback in case iframe.onload already fired
      setTimeout(triggerPrint, 700);
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
          title="พิมพ์ (ปรับกระดาษเป็นแนวนอนและ Scale 80% อัตโนมัติ)"
        >
          <Printer className="w-4 h-4" />
          พิมพ์ยอดการสั่งจอง
        </button>
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
              ระบบได้ตั้งค่ากระดาษเป็นแนวนอนและปรับ Scale เป็น 80% ให้โดยอัตโนมัติแล้ว ในหน้าต่างพิมพ์ (Print Preview) ท่านสามารถเลือก Scale เป็น "ค่าเริ่มต้น (Default)" หรือ 100% ได้ทันที
            </DialogDescription>
          </DialogHeader>
          <img src={printScaleInstructionImg} alt="Print Scale Instruction" className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesRecordsPage;

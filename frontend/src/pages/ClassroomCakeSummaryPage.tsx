import React from "react";
import { useClassroomCakeSummaries } from "@/hooks/useClassroomCakeSummaries";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { Button } from "@/components/ui/button";
import { Printer, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { finalizeClassroom } from "@/utils/api/data";
import { showAlertError, showAlertSuccess, showConfirmDialog } from "@/utils/alerts";
import { useNavigate } from "@tanstack/react-router";
import { printSection } from "@/utils/printUtils";
import "@/styles/print.css";

const ClassroomCakeSummaryPage: React.FC = () => {
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();
  const { summaryData, loading, error, refetch } = useClassroomCakeSummaries(true, undefined, user?.id); // Pass user?.id

  const handlePrint = () => {
    printSection(
      "classroom-summary-print-section",
      "สรุปยอดเค้กของห้องเรียน",
      {
        orientation: "landscape",
        paperSize: "A5",
        scale: 0.75,
        margin: "5mm",
        customStyles: `
          @media print {
            .print\\:hidden, .screen-only {
              display: none !important;
            }
            .space-y-8 {
              margin-top: 0 !important;
            }
            .classroom-summary-card,
            #classroom-summary-print-section .space-y-8 > div,
            #printable-classroom-cake-summary-section .space-y-8 > div {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .classroom-summary-card:not(.first-summary-content),
            #classroom-summary-print-section .space-y-8 > div:not(.first-summary-content),
            #printable-classroom-cake-summary-section .space-y-8 > div:not(.first-summary-content) {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 0 !important;
            }
            table {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              width: 100% !important;
              border-collapse: collapse !important;
              box-sizing: border-box !important;
            }
            th:last-child, td:last-child {
              border-right: 2px solid #1f2937 !important;
            }
            th:first-child, td:first-child {
              border-left: 2px solid #1f2937 !important;
            }
          }
        `,
      }
    );
  };

  const handleFinalize = async () => {
    if (!summaryData || summaryData.length === 0) return;

    const isConfirmed = await showConfirmDialog({
      title: "ยืนยันการสรุปยอด?",
      text: "เมื่อสรุปยอดแล้ว คุณจะไม่สามารถแก้ไขออเดอร์ได้อีก ยืนยันที่จะดำเนินการต่อหรือไม่?",
      confirmButtonText: "ยืนยัน, สรุปยอด",
      cancelButtonText: "ยกเลิก",
    });

    if (isConfirmed) {
      try {
        await Promise.all(summaryData.map((s) => finalizeClassroom(s.classroomId)));
        showAlertSuccess({ title: "สำเร็จ!", text: "สรุปยอดเรียบร้อยแล้ว" });
        refetch();
      } catch (err) {
        console.error(err);
        showAlertError({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถสรุปยอดได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    }
  };

  const allFinalized = summaryData && summaryData.length > 0 && summaryData.every((s) => s.isOrderFinalized);

  return (
    <div className="container mx-auto py-8 print:p-0 print:m-0">
      <div className="mb-4 print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/order-search" })}
          className="flex items-center font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ย้อนกลับ
        </Button>
      </div>

      <div className="flex justify-end mb-4 print:hidden gap-2">
        {!loading && summaryData && summaryData.length > 0 && (
          <>
            {!allFinalized ? (
              <Button onClick={handleFinalize} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Lock className="h-4 w-4" /> สรุปยอดเค้กทั้งหมด
              </Button>
            ) : (
              <Button
                onClick={handlePrint}
                id="print-classroom-summary-button"
                className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 flex items-center"
                title="พิมพ์สรุปยอดเค้กของห้องเรียน (ปรับกระดาษเป็น A5 แนวนอนอัตโนมัติ)"
              >
                <Printer className="w-5 h-5 mr-2" /> พิมพ์สรุปยอดเค้กของห้องเรียน
              </Button>
            )}
          </>
        )}
      </div>

      <div id="classroom-summary-print-section" className="w-full">
        <ClassroomCakeSummaryContent
          summaryData={summaryData}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default ClassroomCakeSummaryPage;
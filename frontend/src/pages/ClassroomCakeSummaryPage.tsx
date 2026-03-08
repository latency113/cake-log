import React from "react";
import { useClassroomCakeSummaries } from "@/hooks/useClassroomCakeSummaries";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { Button } from "@/components/ui/button";
import { Printer, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { finalizeClassroom } from "@/utils/api/data";
import { showAlertError, showAlertSuccess, showConfirmDialog } from "@/utils/alerts";
import { useNavigate } from "@tanstack/react-router";

const ClassroomCakeSummaryPage: React.FC = () => {
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();
  const { summaryData, loading, error, refetch } = useClassroomCakeSummaries(true, undefined, user?.id); // Pass user?.id

  const handlePrint = () => {
    window.print();
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

      <h1 className="text-2xl font-bold text-center mb-6">
        วิทยาลัยอาชีวศึกษาศึกษานครปฐม
        <br />
        ใบสรุปยอดการสั่งเค้ก
      </h1>
      <div className="flex justify-end mb-4 print:hidden gap-2">
        {!loading && summaryData && summaryData.length > 0 && (
          <>
            {!allFinalized ? (
              <Button onClick={handleFinalize} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Lock className="h-4 w-4" /> สรุปยอดเค้กทั้งหมด
              </Button>
            ) : (
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" /> พิมพ์รายงาน
              </Button>
            )}
          </>
        )}
      </div>
      <ClassroomCakeSummaryContent
        summaryData={summaryData}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default ClassroomCakeSummaryPage;
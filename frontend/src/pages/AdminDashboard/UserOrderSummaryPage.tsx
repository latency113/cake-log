import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ClassroomCakeSummaryContent from "@/components/orders/ClassroomCakeSummaryContent";
import { useUserClassroomCakeSummaries } from "@/hooks/useUserClassroomCakeSummaries";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const UserOrderSummaryPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    summaryData,
    loading,
    error,
    // refetch, // refetch is no longer needed in useEffect here
  } = useUserClassroomCakeSummaries(userId, true); // enabled is true to fetch immediately


  // Removed: Refetch data when user context changes or on explicit refetch
  // React.useEffect(() => {
  //   refetch();
  // }, [userId, refetch]);


  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        ข้อผิดพลาด: {error.message}
      </div>
    );
  }

  // Assuming you want a general title for this page
  return (
    <div className="container mx-auto p-4 user-order-summary-print-page">
      <div className="flex justify-between items-center mb-4 screen-only">
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" /> พิมพ์รายงาน
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center print-only">
        สรุปยอดเค้กที่ {user?.firstname} สั่ง
      </h1>

      <ClassroomCakeSummaryContent
        summaryData={summaryData}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default UserOrderSummaryPage;
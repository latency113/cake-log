import React from "react";
import useDashboardData from "../../hooks/useDashboardData";
import DashboardSkeleton from "../../components/dashboard/skeletons/DashboardSkeleton";
import TotalSalesCard from "../../components/dashboard/kpi-cards/TotalSalesCard";
import TotalOrdersCard from "../../components/dashboard/kpi-cards/TotalOrdersCard";
import TopDepartmentsCard from "../../components/dashboard/kpi-cards/TopDepartmentsCard";
import SalesChart from "../../components/dashboard/charts/SalesChart";

const Dashboard: React.FC = () => {
  const { dashboardSummary, loading, error, consolidatedSalesRecords } = useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!dashboardSummary) {
    return <div className="p-4">ไม่มีข้อมูลยอดขาย</div>;
  }

  const { totalSalesAmount, topDepartments, dailyPounds } = dashboardSummary;
  const totalPounds = consolidatedSalesRecords.reduce((sum, record) => sum + record.dailyTotalPound, 0);

  return (
    <div className="max-w-11/12 mx-auto">
      {/* Header Section */}
      <div className="bg-card rounded-sm shadow-md border border-border p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard รายงานยอดปอนด์เค้ก
            </h1>
            <p className="text-muted-foreground">
              ระบบรายงานและติดตามผลการดำเนินงาน
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">อัพเดทล่าสุด</div>
            <div className="text-lg font-semibold text-foreground">
              {new Date().toLocaleDateString("th-TH")}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <TotalSalesCard totalSalesAmount={totalSalesAmount} />
        <TotalOrdersCard totalPounds={totalPounds} />
        <TopDepartmentsCard topDepartments={topDepartments} />
      </div>

      {/* Chart Section */}
      <SalesChart dailyPounds={dailyPounds} />

    </div>
  );
};

export default Dashboard;
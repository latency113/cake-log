import React from "react";
import useDashboardData from "../../hooks/useDashboardData";
import DashboardSkeleton from "../../components/dashboard/skeletons/DashboardSkeleton";
import TotalSalesCard from "../../components/dashboard/kpi-cards/TotalSalesCard";
import TotalOrdersCard from "../../components/dashboard/kpi-cards/TotalOrdersCard";
import TopDepartmentsCard from "../../components/dashboard/kpi-cards/TopDepartmentsCard";
import SalesChart from "../../components/dashboard/charts/SalesChart";
import { LayoutDashboard, Clock } from "lucide-react";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 mt-5 gap-4">
        <div>
          <h1 className="text-4xl semi-bold text-slate-800 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-blue-600" />
            สรุปภาพรวมระบบ
          </h1>
          <p className="text-slate-400 font-medium mt-1 ml-13">
            รายงานสถิติและผลการดำเนินงานยอดปอนด์เค้ก
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-border w-fit self-start md:self-center">
          <Clock className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">อัพเดทล่าสุด</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {new Date().toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <TotalSalesCard totalSalesAmount={totalSalesAmount} />
        <TotalOrdersCard totalPounds={totalPounds} />
        <TopDepartmentsCard topDepartments={topDepartments} />
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <SalesChart dailyPounds={dailyPounds} />
      </div>

    </div>
  );
};

export default Dashboard;
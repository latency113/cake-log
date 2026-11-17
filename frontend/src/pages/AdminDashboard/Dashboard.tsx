import React from "react";
import useDashboardData from "../../hooks/useDashboardData";
import DashboardSkeleton from "../../components/dashboard/skeletons/DashboardSkeleton";
import TotalSalesCard from "../../components/dashboard/kpi-cards/TotalSalesCard";
import TotalOrdersCard from "../../components/dashboard/kpi-cards/TotalOrdersCard";
import TotalOrdersCountCard from "../../components/dashboard/kpi-cards/TotalOrdersCountCard";
import PickupFulfillmentCard from "../../components/dashboard/kpi-cards/PickupFulfillmentCard";
import TopTeamsCard from "../../components/dashboard/kpi-cards/TopTeamsCard";
import TopDepartmentsCard from "../../components/dashboard/kpi-cards/TopDepartmentsCard";
import SalesChart from "../../components/dashboard/charts/SalesChart";
import CakeFlavorBreakdownCard from "../../components/dashboard/widgets/CakeFlavorBreakdownCard";
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

  const {
    totalSalesAmount,
    totalOrdersCount,
    topDepartments,
    topTeams,
    dailyPounds,
    productBreakdown,
    fulfillmentStats,
  } = dashboardSummary;

  const totalPounds =
    fulfillmentStats?.totalPounds ||
    consolidatedSalesRecords.reduce((sum, record) => sum + record.dailyTotalPound, 0);

  return (
    <div className="max-w-11/12 mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-5 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-9 h-9 text-blue-600" />
            สรุปภาพรวมระบบ
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            รายงานสถิติ ยอดสั่งเค้ก อันดับทีม และสถานะการจัดส่ง
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl shadow-sm border border-border w-fit self-start md:self-center">
          <Clock className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              อัพเดทล่าสุด
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              {new Date().toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <TotalSalesCard totalSalesAmount={totalSalesAmount} />
        <TotalOrdersCard totalPounds={totalPounds} />
        <TotalOrdersCountCard
          totalOrdersCount={totalOrdersCount}
          fulfillmentStats={fulfillmentStats}
        />
        <PickupFulfillmentCard fulfillmentStats={fulfillmentStats} />
      </div>

      {/* Row 2: Sales Chart + Top Teams Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
        <div className="lg:col-span-7">
          <SalesChart dailyPounds={dailyPounds} />
        </div>
        <div className="lg:col-span-5">
          <TopTeamsCard topTeams={topTeams || []} />
        </div>
      </div>

      {/* Row 3: Cake Flavor Breakdown + Top Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <CakeFlavorBreakdownCard productBreakdown={productBreakdown || []} />
        </div>
        <div className="lg:col-span-5">
          <TopDepartmentsCard topDepartments={topDepartments || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

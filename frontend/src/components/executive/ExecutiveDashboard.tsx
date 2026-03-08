import { useState, useEffect } from "react";
import useDashboardData from "../../hooks/useDashboardData";
import ExecutiveDashboardSkeleton from "./ExecutiveDashboardSkeleton";
import TotalSalesCard from "../dashboard/kpi-cards/TotalSalesCard";
import TotalOrdersCard from "../dashboard/kpi-cards/TotalOrdersCard";
import TopDepartmentsCard from "../dashboard/kpi-cards/TopDepartmentsCard";
import SalesChart from "../dashboard/charts/SalesChart";
import DepartmentSalesBarChart from "../dashboard/charts/DepartmentSalesBarChart";
import DepartmentCakeQuantityChart from "../dashboard/charts/DepartmentCakeQuantityChart";
import TeamLeaderboard from "../dashboard/tables/TeamLeaderboard";
import { getTeams } from "../../utils/api/teams";
import type { TeamWithRelations } from "../../types/team";

const ExecutiveDashboard = () => {
  const { dashboardSummary, loading, error, consolidatedSalesRecords } =
    useDashboardData();
  const [teams, setTeams] = useState<TeamWithRelations[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        setTeamsLoading(true);
        const teamsResponse = await getTeams(1, 9999);
        if (teamsResponse && teamsResponse.data) {
          setTeams(teamsResponse.data);
        } else if (Array.isArray(teamsResponse)) {
          setTeams(teamsResponse);
        }
      } catch (err: any) {
        console.error("Failed to fetch teams data:", err);
        setTeamsError(err.message || "Error fetching teams");
      } finally {
        setTeamsLoading(false);
      }
    };
    fetchTeamsData();
  }, []);

  if (loading || teamsLoading) {
    return <ExecutiveDashboardSkeleton />;
  }

  if (error || teamsError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl text-red-700 dark:text-red-400">
        <h3 className="font-bold mb-1">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
        <p className="text-sm">{error || teamsError}</p>
      </div>
    );
  }

  if (!dashboardSummary) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          ไม่มีข้อมูลยอดขายในขณะนี้
        </p>
      </div>
    );
  }

  const {
    totalSalesAmount,
    topDepartments,
    dailyPounds,
    departmentPounds,
    departmentCakeQuantities,
  } = dashboardSummary;
  const totalPounds = consolidatedSalesRecords.reduce(
    (sum, record) => sum + record.dailyTotalPound,
    0
  );

  return (
    <div className="space-y-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <TotalSalesCard totalSalesAmount={totalSalesAmount} />
        <TotalOrdersCard totalPounds={totalPounds} />
        <TopDepartmentsCard topDepartments={topDepartments} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <SalesChart dailyPounds={dailyPounds} />
      </div>

      {/* Charts and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <DepartmentSalesBarChart departmentPounds={departmentPounds} />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <DepartmentCakeQuantityChart
            departmentCakeQuantities={departmentCakeQuantities}
          />
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            ตารางจัดอันดับทีมและบุคคล
          </h2>
        </div>
        <TeamLeaderboard teams={teams} />
      </div>
    </div>
  );
};

export default ExecutiveDashboard;

import React, { useState, useEffect } from "react";
import useDashboardData from "../../hooks/useDashboardData";
import LeaderboardSkeleton from "../../components/dashboard/skeletons/LeaderboardSkeleton";
import DepartmentSalesBarChart from "../../components/dashboard/charts/DepartmentSalesBarChart";
import DepartmentCakeQuantityChart from "../../components/dashboard/charts/DepartmentCakeQuantityChart";
import TeamLeaderboard from "../../components/dashboard/tables/TeamLeaderboard";
import { getTeams } from "@/utils/api/teams";
import type { TeamWithRelations } from "@/types/team";
import { ChartNoAxesColumn, Printer } from "lucide-react";
import { getCakeSettings } from "../../utils/api/settings"; // Import getCakeSettings
import type { ICakeSettings } from "../../types/cake"; // Import ICakeSettings
// import * as XLSX from "xlsx";
// import type { WorkSheet } from "xlsx";

// type MyWorkSheet = WorkSheet;

import { Button } from "@/components/ui/button";
import "../../styles/print.css";

const LeaderboardPage: React.FC = () => {
  const { dashboardSummary, loading, error } = useDashboardData();
  const [teams, setTeams] = useState<TeamWithRelations[]>([]);

  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);

  const selectedYear = localStorage.getItem("academicYear");
  const displayAcademicYear = cakeSettings?.academicYear
    ? cakeSettings.academicYear
    : selectedYear || (new Date().getFullYear() + 543).toString();

  const displayNewYear = (parseInt(displayAcademicYear) + 1).toString();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
      } catch (error) {
        console.error("Failed to fetch cake settings:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const teamsResponse = await getTeams(1, 9999);
        if (teamsResponse && teamsResponse.data) {
          setTeams(teamsResponse.data);
        } else if (Array.isArray(teamsResponse)) {
          setTeams(teamsResponse);
        }
      } catch (err) {
        console.error("Failed to fetch teams data:", err);
      }
    };
    fetchTeamsData();
  }, []);

  useEffect(() => {
    // Inject print styles specifically for this leaderboard page
    const styleId = "leaderboard-print-page-style";
    let printStyle = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!printStyle) {
      printStyle = document.createElement("style");
      printStyle.id = styleId;
      document.head.appendChild(printStyle);
    }
    printStyle.innerHTML = `
      @page {
        size: landscape;
        margin: 5mm;
      }
      @media print {
        html, body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          zoom: 0.97 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        header,
        #admin-sidebar,
        #non-printable-header,
        #print-button,
        [class*="print:hidden"],
        .print\\:hidden {
          display: none !important;
        }
      }
    `;

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const handlePrint = () => {
    // Ensure styles are present before triggering print
    const styleId = "leaderboard-print-page-style";
    if (!document.getElementById(styleId)) {
      const printStyle = document.createElement("style");
      printStyle.id = styleId;
      printStyle.innerHTML = `
        @page {
          size: landscape;
          margin: 5mm;
        }
        @media print {
          html, body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            zoom: 0.97 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header,
          #admin-sidebar,
          #non-printable-header,
          #print-button,
          [class*="print:hidden"],
          .print\\:hidden {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
    }
    window.print();
  };

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!dashboardSummary) {
    return <div className="p-4">ไม่มีข้อมูลยอดขาย</div>;
  }

  const { departmentPounds, departmentCakeQuantities } = dashboardSummary;

  const colors = [
    "#4F46E5",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#8B5CF6",
    "#D946EF",
    "#EC4899",
    "#6366F1",
    "#F97316",
    "#14B8A6",
    "#65A30D",
  ];

  const departmentPoundsSorted = [...departmentPounds].sort(
    (a, b) => b.totalPounds - a.totalPounds
  );


  const departmentColorMap: { [key: string]: string } = {};
  departmentPoundsSorted.forEach((dept, index) => {
    departmentColorMap[dept.name] = colors[index % colors.length];
  });

  const getContrastColor = (hexColor: string): string => {
    if (!hexColor) return "#000000";
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? "#000000" : "#ffffff";
  };

  return (
    <>
      <div className="leaderboard-print-page max-w-11/12 mx-auto">
        <div id="non-printable-header" className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl shadow-md p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <ChartNoAxesColumn className="w-10 h-10 mr-4 text-white" />
                แสดงอันดับจำนวนปอนด์
              </h1>
              <p className="text-white text-lg">
                รายการแสดงจำนวนปอนด์ของแต่ละแผนก
              </p>
            </div>
            <Button
              id="print-button"
              onClick={handlePrint}
              className="mt-4 sm:mt-0 bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:bg-white dark:text-amber-700 dark:hover:bg-amber-50 dark:hover:text-amber-800 font-semibold shadow-sm"
              title="พิมพ์หน้านี้ (ปรับกระดาษเป็นแนวนอนและ Scale 97% อัตโนมัติ)"
            >
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์หน้านี้
            </Button>
          </div>
        </div>

        <div id="printable-charts-section">
          {/* Department Sales (Pounds) Table - Visible only when printing */}
          <div id="printable-department-pounds-table">
            <h2 className="text-lg font-semibold m-4 text-center">รายงานยอดการจำหน่ายเค้กปีใหม่ พ.ศ.{displayNewYear} ใบสั่งจอง (ประจำปีการศึกษา {displayAcademicYear})</h2>
            <table>
              <thead>
                <tr>
                  {departmentPoundsSorted.map((dept) => {
                    const bg = departmentColorMap[dept.name];
                    const textColor = getContrastColor(bg);
                    return (
                      <th
                        key={dept.name}
                        className="p-2 border border-gray-300 font-bold"
                        style={{ backgroundColor: bg, color: textColor }}
                      >
                        <div>{dept.name}</div>
                      </th>
                    );
                  })}
                  <th
                    className="p-2 border border-gray-300 font-bold"
                    style={{ backgroundColor: "#f0f0f0", color: "#000000" }}
                  >
                    รวม ปอนด์
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {departmentPoundsSorted.map((dept) => (
                    <td
                      key={dept.name}
                      className="p-2 border border-gray-300 text-center font-bold"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                      }}
                    >
                      {dept.totalPounds}
                    </td>
                  ))}
                  <td
                    className="p-2 border border-gray-300 text-center font-bold"
                    style={{ backgroundColor: "#f9fafb", color: "#000000" }}
                  >
                    {departmentPoundsSorted.reduce((sum, dept) => sum + dept.totalPounds, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <DepartmentSalesBarChart departmentPounds={departmentPoundsSorted} />
          </div>
          <div className="mb-8">
            <DepartmentCakeQuantityChart
              departmentCakeQuantities={departmentCakeQuantities}
            />
          </div>


        </div>

        <div id="printable-team-leaderboard" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-center">รายงานยอดการจำหน่ายเค้กปีใหม่ พ.ศ.{displayNewYear} ใบสั่งจอง (ประจำปีการศึกษา {displayAcademicYear})</h2>
              <h2 className="text-2xl font-semibold text-foreground">
                อันดับยอดขายทีม
              </h2>
            </div>
          </div>
          <TeamLeaderboard teams={teams} />
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
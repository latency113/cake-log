import React, { useState, useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import AdminSidebar from "./AdminSidebar";
import { YearSelector } from "../common/YearSelector";
import { getSystemActiveYear } from "@/utils/api/settings";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

const DashboardLayout: React.FC = () => {
  const [activeSystemYear, setActiveSystemYear] = useState<string>("2569");
  const currentSelectedYear = localStorage.getItem("academicYear") || activeSystemYear;
  const isHistorical = Boolean(currentSelectedYear && currentSelectedYear !== activeSystemYear);

  useEffect(() => {
    getSystemActiveYear()
      .then((res) => {
        if (res?.academicYear) setActiveSystemYear(res.academicYear);
      })
      .catch(() => {});
  }, []);

  const handleResetToCurrentYear = () => {
    localStorage.setItem("academicYear", activeSystemYear);
    sessionStorage.removeItem("academicYearManual");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar with Year Selector & System Info */}
        <header className="sticky top-0 z-20 h-13 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 shadow-2xs print:hidden">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">แผงควบคุมระบบ (Admin)</span>
            <span>/</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40">
              ปีปัจจุบัน: {activeSystemYear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              เลือกปีข้อมูล:
            </span>
            <YearSelector />
          </div>
        </header>

        {/* Warning Banner when viewing historical academic year */}
        {isHistorical && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200 print:hidden">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>โหมดดูข้อมูลย้อนหลัง:</strong> คุณกำลังดูข้อมูลของ<strong>ปีการศึกษา {currentSelectedYear}</strong> (ไม่ใช่ปีปัจจุบัน)
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetToCurrentYear}
              className="h-6.5 text-xs border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-950 dark:text-amber-100 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>กลับสู่ปีปัจจุบัน ({activeSystemYear})</span>
            </Button>
          </div>
        )}

        <main className="flex-1 min-w-0 p-6 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

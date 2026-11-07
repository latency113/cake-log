import React, { useEffect, useState } from "react";
import { Wrench, RefreshCw, LogIn, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSystemStatus, type ISystemStatus } from "@/utils/api/settings";
import { decodeJwtToken } from "@/utils/auth";

const MaintenancePage: React.FC = () => {
  const [status, setStatus] = useState<ISystemStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const fetchStatus = async () => {
    setIsChecking(true);
    try {
      const data = await getSystemStatus();
      setStatus(data);
      if (!data.isMaintenanceMode) {
        // If maintenance mode is now off, go to home
        window.location.href = "/";
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogin = () => {
    // Clear non-admin tokens so that the admin login form appears
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded = decodeJwtToken(token);
      const role = decoded?.role?.toLowerCase();
      if (role !== "superadmin" && role !== "admin") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-950 dark:via-zinc-900 dark:to-stone-950 flex flex-col items-center justify-center p-4 sm:p-6 text-foreground">
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Animated Badge & Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 text-amber-600 dark:text-amber-400 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            โหมดปิดปรับปรุงระบบ (Maintenance Mode)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            ระบบกำลังปิดปรับปรุงชั่วคราว
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            ขออภัยในความไม่สะดวก ระบบกำลังอยู่ในระหว่างการปรับปรุงข้อมูลหรือเตรียมความพร้อม
          </p>
        </div>

        {/* Custom Message Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            ข้อความแจ้งเตือนจากผู้ดูแลระบบ
          </p>
          <div className="p-3.5 rounded-xl bg-muted/50 dark:bg-muted/20 border border-border/60">
            <p className="text-sm sm:text-base text-foreground whitespace-pre-line leading-relaxed">
              {status?.maintenanceMessage || "ระบบปิดรับการทำรายการชั่วคราวเพื่อตรวจสอบและประมวลผลข้อมูล กรุณากลับมาใหม่อีกครั้งในภายหลัง"}
            </p>
          </div>
          {status?.academicYear && (
            <p className="text-xs text-muted-foreground text-right pt-1">
              ปีการศึกษา {status.academicYear}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => window.location.reload()}
            disabled={isChecking}
            variant="outline"
            className="w-full sm:w-auto gap-2 border-border hover:bg-muted/60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "กำลังตรวจสอบ..." : "ลองใหม่อีกครั้ง"}
          </Button>

          <Button
            onClick={handleAdminLogin}
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            เข้าสู่ระบบสำหรับผู้ดูแลระบบ
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4">
          ระบบบริหารจัดการสั่งจองเค้กปีใหม่ (NVC Cake) • วิทยาลัยอาชีวศึกษานครปฐม
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;

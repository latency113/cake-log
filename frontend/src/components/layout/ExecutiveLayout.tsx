import React from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LogOut, User, PieChart } from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";

const ExecutiveLayout: React.FC = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
            {/* Left: Branding & Profile */}
            <div className="flex items-center gap-4 sm:gap-8 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <PieChart size={22} className="text-white" />
                </div>
                <div className="leading-tight hidden sm:block">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    NVC Cake
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    EXECUTIVE SUMMARY
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-inner flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-none mb-1">
                    {user?.firstname} {user?.lastname}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <ModeToggle />
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2 px-3 rounded-xl transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline font-semibold">
                  ออกจากระบบ
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} NVC Cake Program. All rights
            reserved. by Khan Samnuan IT Department
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExecutiveLayout;

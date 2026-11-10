import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "../theme/mode-toggle";
import { Button } from "../../components/ui/button";
import {
  LayoutDashboard,
  SquareChartGantt,
  Trophy,
  FileSpreadsheet,
  ShoppingBag,
  BookOpen,
  Package,
  School,
  Building2,
  Users2,
  GraduationCap,
  UserCog,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface MenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  iconBg: string;
  activeClass: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const loggedInUsername = user?.username;
  const loggedInUserRole = user?.role?.toLowerCase() || "";

  // Persist collapsed state across page reloads
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
  };

  // Menu structure with distinctive colorful icon badges & matching active styles
  const menuSections: MenuSection[] = [
    {
      title: "ภาพรวม",
      items: [
        {
          to: "/dashboard",
          label: "รวมแดชบอร์ด",
          icon: LayoutDashboard,
          exact: true,
          iconBg:
            "bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
          activeClass:
            "!bg-blue-50/90 dark:!bg-blue-950/40 !text-blue-700 dark:!text-blue-300 ring-1 ring-blue-300 dark:ring-blue-800",
        },
        {
          to: "/dashboard/sales-records",
          label: "ยอดการสั่งจอง",
          icon: SquareChartGantt,
          iconBg:
            "bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
          activeClass:
            "!bg-rose-50/90 dark:!bg-rose-950/40 !text-rose-700 dark:!text-rose-300 ring-1 ring-rose-300 dark:ring-rose-800",
        },
        {
          to: "/dashboard/leaderboard",
          label: "แสดงอันดับ",
          icon: Trophy,
          iconBg:
            "bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
          activeClass:
            "!bg-amber-50/90 dark:!bg-amber-950/40 !text-amber-700 dark:!text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800",
        },
        {
          to: "/dashboard/classrooms-report",
          label: "รายงานผล",
          icon: FileSpreadsheet,
          iconBg:
            "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
          activeClass:
            "!bg-indigo-50/90 dark:!bg-indigo-950/40 !text-indigo-700 dark:!text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-800",
        },
      ],
    },
    ...(loggedInUserRole === "officer1"
      ? [
          {
            title: "สำหรับเจ้าหน้าที่",
            items: [
              {
                to: "/dashboard/orders",
                label: "แสดงสถานะออเดอร์",
                icon: ShoppingBag,
                iconBg:
                  "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
                activeClass:
                  "!bg-emerald-50/90 dark:!bg-emerald-950/40 !text-emerald-700 dark:!text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-800",
              },
            ],
          },
        ]
      : []),
    ...(loggedInUserRole === "superadmin"
      ? [
          {
            title: "การจัดการคำสั่งซื้อ",
            items: [
              {
                to: "/dashboard/orders",
                label: "จัดการคำสั่งซื้อ",
                icon: ShoppingBag,
                iconBg:
                  "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
                activeClass:
                  "!bg-emerald-50/90 dark:!bg-emerald-950/40 !text-emerald-700 dark:!text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-800",
              },
              {
                to: "/dashboard/order-books",
                label: "จัดการสมุดจอง",
                icon: BookOpen,
                iconBg:
                  "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-400",
                activeClass:
                  "!bg-fuchsia-50/90 dark:!bg-fuchsia-950/40 !text-fuchsia-700 dark:!text-fuchsia-300 ring-1 ring-fuchsia-300 dark:ring-fuchsia-800",
              },
            ],
          },
          {
            title: "ข้อมูลระบบ & ตั้งค่า",
            items: [
              {
                to: "/dashboard/products",
                label: "จัดการสินค้า",
                icon: Package,
                iconBg:
                  "bg-orange-100 text-orange-600 dark:bg-orange-950/70 dark:text-orange-400",
                activeClass:
                  "!bg-orange-50/90 dark:!bg-orange-950/40 !text-orange-700 dark:!text-orange-300 ring-1 ring-orange-300 dark:ring-orange-800",
              },
              {
                to: "/dashboard/classrooms",
                label: "จัดการชั้นเรียน",
                icon: School,
                iconBg:
                  "bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400",
                activeClass:
                  "!bg-red-50/90 dark:!bg-red-950/40 !text-red-700 dark:!text-red-300 ring-1 ring-red-300 dark:ring-red-800",
              },
              {
                to: "/dashboard/departments",
                label: "จัดการแผนก",
                icon: Building2,
                iconBg:
                  "bg-teal-100 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
                activeClass:
                  "!bg-teal-50/90 dark:!bg-teal-950/40 !text-teal-700 dark:!text-teal-300 ring-1 ring-teal-300 dark:ring-teal-800",
              },
              {
                to: "/dashboard/teams",
                label: "จัดการทีม",
                icon: Users2,
                iconBg:
                  "bg-pink-100 text-pink-600 dark:bg-pink-950/70 dark:text-pink-400",
                activeClass:
                  "!bg-pink-50/90 dark:!bg-pink-950/40 !text-pink-700 dark:!text-pink-300 ring-1 ring-pink-300 dark:ring-pink-800",
              },
              {
                to: "/dashboard/teachers",
                label: "จัดการรายชื่อครู",
                icon: GraduationCap,
                iconBg:
                  "bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400",
                activeClass:
                  "!bg-sky-50/90 dark:!bg-sky-950/40 !text-sky-700 dark:!text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800",
              },
              {
                to: "/dashboard/users",
                label: "จัดการผู้ใช้งาน",
                icon: UserCog,
                iconBg:
                  "bg-purple-100 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
                activeClass:
                  "!bg-purple-50/90 dark:!bg-purple-950/40 !text-purple-700 dark:!text-purple-300 ring-1 ring-purple-300 dark:ring-purple-800",
              },
              {
                to: "/dashboard/settings",
                label: "ตั้งค่าระบบ",
                icon: Settings,
                iconBg:
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                activeClass:
                  "!bg-slate-100 dark:!bg-slate-800/80 !text-slate-900 dark:!text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700",
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside
      id="admin-sidebar"
      className={`sticky top-0 h-screen shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* 1. Header Section */}
      <div className="h-18 px-4 border-b border-sidebar-border flex items-center justify-between shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <img src="https://www.nc.ac.th/img/logo.png" alt="" width={30} height={30}/>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-sidebar-foreground truncate leading-tight">
                NVC Cake Log
              </h2>
              <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5 font-medium">
                แผงควบคุมระบบ
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <img src="https://www.nc.ac.th/img/logo.png" alt="" width={30} height={30}/>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          title={isCollapsed ? "ขยายแถบเมนู (Expand)" : "ย่อแถบเมนู (Collapse)"}
          className={`h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent shrink-0 rounded-lg ${
            isCollapsed ? "hidden" : "flex"
          }`}
        >
          <PanelLeftClose className="w-5 h-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* When collapsed, provide an uncollapse button at the top */}
      {isCollapsed && (
        <div className="px-2 pt-2.5 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            title="ขยายแถบเมนู (Expand)"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-3.5 py-4 overflow-y-auto overflow-x-hidden space-y-6 scrollbar-thin">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx}>
            {/* Section Header */}
            {!isCollapsed ? (
              <h3 className="text-xs font-bold text-muted-foreground/90 tracking-wider uppercase px-2 mb-2.5">
                {section.title}
              </h3>
            ) : (
              <div className="h-px bg-sidebar-border/60 mx-1 my-3" />
            )}

            {/* Section Items */}
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: item.exact }}
                      activeProps={{
                        className: `${item.activeClass} font-semibold shadow-xs border-current/20`,
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative flex items-center rounded-xl transition-all duration-200 ease-out border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm ${
                        isCollapsed
                          ? "justify-center h-12 w-full px-0 hover:scale-105"
                          : "gap-3.5 px-3.5 py-2.5 text-[15px] hover:translate-x-1.5"
                      }`}
                    >
                      {/* Colorful Icon Badge Box */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-all duration-200 group-hover:scale-110 group-hover:shadow-md ${item.iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {!isCollapsed && (
                        <span className="truncate font-medium text-sidebar-foreground group-hover:text-foreground group-hover:font-semibold transition-colors">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 3. Footer Section (User Profile & Controls) */}
      <div className="p-3.5 border-t border-sidebar-border bg-sidebar shrink-0">
        {!isCollapsed ? (
          <div className="flex flex-col gap-3">
            {/* User Profile Info */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/50">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {loggedInUsername
                    ? loggedInUsername.charAt(0).toUpperCase()
                    : "A"}
                </div>
                {/* Online indicator dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                  {loggedInUsername || "ผู้ใช้งาน"}
                </div>
                <div className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                  {loggedInUserRole === "superadmin"
                    ? "ผู้ดูแลระบบ"
                    : loggedInUserRole === "officer1"
                    ? "ฝ่ายจ่ายเค้ก"
                    : "เจ้าหน้าที่"}
                </div>
              </div>
            </div>

            {/* Quick Actions (Theme & Logout) */}
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="flex-1 h-9 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-red-400 border-sidebar-border gap-1.5 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Collapsed Mode Footer */
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="relative"
              title={`${loggedInUsername} (${
                loggedInUserRole === "superadmin"
                  ? "ผู้ดูแลระบบ"
                  : "เจ้าหน้าที่"
              })`}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {loggedInUsername ? loggedInUsername.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="w-full flex justify-center">
              <ModeToggle />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="ออกจากระบบ"
              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;

import React from "react";
import { Button } from "../../components/ui/button";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "../theme/mode-toggle";
import {
  ChartLine,
  ChartNoAxesColumn,
  ShoppingBag,
  UserCog,
  Package,
  Users,
  Home,
  Building,
  SquareChartGantt,
  Settings,
  Book,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const loggedInUsername = user?.username;
  const loggedInUserRole = user?.role?.toLowerCase();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      id="admin-sidebar"
      className="h-screen w-80 bg-sidebar text-sidebar-foreground flex flex-col border-r-2 border-sidebar-border"
    >
      {/* Header Section */}
      {/* Header Section */}
      <div className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-normal text-sidebar-foreground">
              หน้าจอแอดมิน
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              NVC Cake Log
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* User Profile Card */}
          <div className="bg-sidebar-accent/30 rounded-lg p-3 border border-sidebar-border/50">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-sm font-normal text-white shadow">
                {loggedInUsername
                  ? loggedInUsername.charAt(0).toUpperCase()
                  : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">
                  {loggedInUsername}
                </div>
                <div className="text-xs text-muted-foreground">
                  {loggedInUserRole === "superadmin"
                    ? "ผู้ดูแลระบบ"
                    : "เจ้าหน้าที่"}
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="w-full text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              ออกจากระบบ
            </Button>
          </div>

          {/* Status and Theme Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-3 py-2 border border-emerald-200 dark:border-emerald-900/30">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  ออนไลน์
                </span>
              </div>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-5 overflow-y-auto">
        <div className="mb-8">
          <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-4 px-4">
            ภาพรวม
          </h3>
          <ul className="space-y-2.5">
            <li>
              <Link
                to="/dashboard"
                activeProps={{
                  className:
                    "!bg-blue-600 !text-white !shadow-lg !border-b-4 !border-blue-300 ",
                }}
                activeOptions={{
                  exact: true,
                }}
                className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                  <ChartLine className="w-5 h-5 text-blue-600 group-[.active]:text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-normal text-base">รวมแดชบอร์ด</span>
                </div>
                <svg
                  className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/sales-records"
                activeProps={{
                  className:
                    "!bg-red-600 !text-white !shadow-lg !border-b-4 !border-red-300 ",
                }}
                className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                  <SquareChartGantt className="w-5 h-5 text-red-600 group-[.active]:text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-normal text-base truncate">
                    ยอดการสั่งจอง
                  </span>
                </div>
                <svg
                  className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/leaderboard"
                activeProps={{
                  className:
                    "!bg-yellow-600 !text-white !shadow-lg !border-b-4 !border-yellow-300 ",
                }}
                className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                  <ChartNoAxesColumn className="w-5 h-5 text-yellow-600 group-[.active]:text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-normal text-base">แสดงอันดับ</span>
                </div>
                <svg
                  className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/classrooms-report"
                activeProps={{
                  className:
                    "!bg-indigo-600 !text-white !shadow-lg !border-b-4 !border-indigo-300 ",
                }}
                className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                  <Home className="w-5 h-5 text-indigo-600 group-[.active]:text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-normal text-base truncate">รายงานผล</span>
                </div>
                <svg
                  className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </li>
          </ul>
        </div>

        {loggedInUserRole === "officer1" && (
          <div className="mb-8">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-4 px-4">
              สำหรับเจ้าหน้าที่
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/dashboard/orders"
                  activeProps={{
                    className:
                      "!bg-blue-600 !text-white !shadow-lg !border-b-4 !border-blue-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <ShoppingBag className="w-5 h-5 text-blue-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">
                      แสดงสถานะออเดอร์
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {loggedInUserRole === "superadmin" && (
          <div className="mb-8">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-4 px-4">
              ส่วนการจัดการ
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/dashboard/orders"
                  activeProps={{
                    className:
                      "!bg-green-600 !text-white !shadow-lg !border-b-4 !border-green-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <ShoppingBag className="w-5 h-5 text-green-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">
                      จัดการคำสั่งซื้อ
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/users"
                  activeProps={{
                    className:
                      "!bg-purple-600 !text-white !shadow-lg !border-b-4 !border-purple-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <UserCog className="w-5 h-5 text-purple-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">จัดการผู้ใช้งาน</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/products"
                  activeProps={{
                    className:
                      "!bg-orange-600 !text-white !shadow-lg !border-b-4 !border-orange-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Package className="w-5 h-5 text-orange-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">จัดการสินค้า</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/teachers"
                  activeProps={{
                    className:
                      "!bg-blue-600 !text-white !shadow-lg !border-b-4 !border-blue-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Users className="w-5 h-5 text-blue-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">
                      จัดการรายชื่อครู
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/teams"
                  activeProps={{
                    className:
                      "!bg-pink-600 !text-white !shadow-lg !border-b-4 !border-pink-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Users className="w-5 h-5 text-pink-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">จัดการทีม</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/classrooms"
                  activeProps={{
                    className:
                      "!bg-red-600 !text-white !shadow-lg !border-b-4 !border-red-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  {" "}
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Home className="w-5 h-5 text-red-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">จัดการชั้นเรียน</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/departments"
                  activeProps={{
                    className:
                      "!bg-teal-600 !text-white !shadow-lg !border-b-4 !border-teal-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Building className="w-5 h-5 text-teal-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">จัดการแผนก</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/order-books"
                  activeProps={{
                    className:
                      "!bg-pink-600 !text-white !shadow-lg !border-b-4 !border-pink-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Book className="w-5 h-5 text-pink-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">จัดการสมุดจอง</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/settings"
                  activeProps={{
                    className:
                      "!bg-gray-600 !text-white !shadow-lg !border-b-4 !border-gray-300 ",
                  }}
                  className="group flex items-center space-x-4 py-2 px-5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 group-[.active]:bg-white/20 transition-all duration-200 shadow-md">
                    <Settings className="w-5 h-5 text-gray-600 group-[.active]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-normal text-base">ตั้งค่าระบบ</span>
                  </div>
                  <svg
                    className="w-5 h-5  group-[.active]:text-white transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

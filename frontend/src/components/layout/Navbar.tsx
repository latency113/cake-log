import React from "react";
import {
  ShoppingBag,
  Sparkles,
  ChevronDown,
  LogOut,
  GraduationCap,
  Home,
  Search,
} from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const loggedInUsername = user?.username;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isHomeActive =
    location.pathname === "/select-book" || location.pathname === "/home";
  const isSearchActive = location.pathname.startsWith("/order-search");
  const isClassroomActive =
    location.pathname.startsWith("/classroom") ||
    location.pathname.startsWith("/my-classroom");

  return (
    <>
      <header
        className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 sm:px-6 drop-shadow-md sm:drop-shadow-lg ${className}`}
      >
        <div className="relative py-1 md:py-2">
          <div className="container mx-auto flex justify-between items-center gap-2">
            {/* Logo and Title Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer shrink-0">
              <Link
                to="/select-book"
                className="flex items-center space-x-2 sm:space-x-3 group"
              >
                <div className="p-1.5 sm:p-2 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300 shrink-0">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-wide leading-tight">
                    NVC Cake Log<span className="hidden sm:inline"> Program</span>
                  </h1>
                  <div className="flex items-center space-x-1 sm:space-x-2 mt-0.5 sm:mt-1">
                    <Sparkles className="w-3 h-3 text-blue-200 hidden sm:inline" />
                    <span className="text-[10px] sm:text-xs text-blue-100 font-medium">
                      v1.5.3
                    </span>
                    <span className="text-[9px] sm:text-[11px] bg-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-medium border border-white/20 whitespace-nowrap">
                      ปี 2569
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 shrink-0">
              {/* Desktop Navigation Links (>= md) */}
              {token && (
                <div className="hidden md:flex items-center space-x-2 shrink-0">
                  <Link to="/select-book">
                    <button
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition-colors backdrop-blur-sm border whitespace-nowrap cursor-pointer ${
                        isHomeActive
                          ? "bg-white/25 border-white/40 shadow-sm font-semibold"
                          : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 font-medium"
                      }`}
                      title="หน้าแรก"
                    >
                      <Home className="w-4 h-4 shrink-0" />
                      <span className="text-sm">หน้าแรก</span>
                    </button>
                  </Link>

                  <Link to="/order-search">
                    <button
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition-colors backdrop-blur-sm border whitespace-nowrap cursor-pointer ${
                        isSearchActive
                          ? "bg-white/25 border-white/40 shadow-sm font-semibold"
                          : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 font-medium"
                      }`}
                      title="ค้นหาออเดอร์"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span className="text-sm">ค้นหาออเดอร์</span>
                    </button>
                  </Link>

                  <Link to="/classroom">
                    <button
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition-colors backdrop-blur-sm border whitespace-nowrap cursor-pointer ${
                        isClassroomActive
                          ? "bg-white/25 border-white/40 shadow-sm font-semibold"
                          : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 font-medium"
                      }`}
                      title="รายชื่อนักเรียน"
                    >
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span className="text-sm">รายชื่อนักเรียน</span>
                    </button>
                  </Link>
                </div>
              )}

              {/* Desktop User Dropdown (>= md) */}
              {token && (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-md px-3 py-2 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg group whitespace-nowrap shrink-0 cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0">
                          {loggedInUsername?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="text-left max-w-[120px] truncate">
                          <div className="text-sm font-semibold leading-tight truncate">
                            {loggedInUsername}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white transition-colors shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 bg-card text-card-foreground shadow-xl rounded-lg p-1.5 border border-border z-50"
                      align="end"
                    >
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2 p-2 rounded-md"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Navigation Bar (< md) - Inspired by Design Ideas */}
      {token && (
        <nav
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl px-2 py-1.5 text-card-foreground print:hidden transition-all duration-300"
        >
          <div className="flex items-center justify-around">
            {/* 1. Home / Select Book */}
            <Link
              to="/select-book"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isHomeActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <Home
                className={`w-5 h-5 transition-transform ${
                  isHomeActive ? "scale-110" : ""
                }`}
              />
              <span className="text-[11px] mt-0.5 leading-tight">หน้าแรก</span>
              {isHomeActive && (
                <span className="w-5 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </Link>

            {/* 2. Order Search */}
            <Link
              to="/order-search"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isSearchActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <Search
                className={`w-5 h-5 transition-transform ${
                  isSearchActive ? "scale-110" : ""
                }`}
              />
              <span className="text-[11px] mt-0.5 leading-tight">ค้นหา</span>
              {isSearchActive && (
                <span className="w-5 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </Link>

            {/* 3. Classrooms / Students */}
            <Link
              to="/classroom"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isClassroomActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <GraduationCap
                className={`w-5 h-5 transition-transform ${
                  isClassroomActive ? "scale-110" : ""
                }`}
              />
              <span className="text-[11px] mt-0.5 leading-tight">ห้องเรียน</span>
              {isClassroomActive && (
                <span className="w-5 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </Link>

            {/* 4. User Profile / Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-all cursor-pointer"
                  aria-label="บัญชีผู้ใช้"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    {loggedInUsername?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-[11px] mt-0.5 leading-tight truncate max-w-[55px]">
                    {loggedInUsername || "โปรไฟล์"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 bg-card text-card-foreground shadow-xl rounded-lg p-1.5 border border-border z-50 mb-2"
                align="center"
                side="top"
              >
                <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border/50 font-medium">
                  เข้าสู่ระบบโดย:{" "}
                  <span className="text-foreground font-bold">
                    {loggedInUsername}
                  </span>
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2 p-2 rounded-md mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;

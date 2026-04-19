import React, { useState } from "react";
import {
  ShoppingBag,
  Sparkles,
  ChevronUp,
  ChevronDown,
  LogOut,
  BookOpen,
} from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";
import { Link, useNavigate } from "@tanstack/react-router"; // Import useNavigate
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const loggedInUsername = user?.username;
  const toggleNavbar = () => {
    setIsNavbarHidden(!isNavbarHidden);
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <>
      <header
        className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white transition-all duration-300 ease-in-out ${
          isNavbarHidden
            ? "max-h-0 overflow-hidden shadow-none"
            : "max-h-screen py-3 px-6 drop-shadow-lg md:py-4"
        } ${className}`}
      >
        <div className="relative py-3 px-6 drop-shadow-lg md:py-4">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo and Title Section */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <a
                href="/select-book"
                className="flex items-center space-x-3 group"
              >
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
                  <ShoppingBag className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-wide">
                    NVC Cake Log Program
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Sparkles className="w-3 h-3 text-blue-200" />
                    <span className="text-xs text-blue-100 font-medium">
                      Version 1.5
                    </span>
                  </div>
                </div>
              </a>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {token && (
                <>
                  <Link to="/order-search">
                    <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-md transition-colors backdrop-blur-sm border border-white/20 hover:border-white/30">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-md font-medium">ค้นหาออเดอร์</span>
                    </button>
                  </Link>

                  <Link to="/classroom-cake-summary">
                    <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-md transition-colors backdrop-blur-sm border border-white/20 hover:border-white/30">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-md font-medium">
                        สรุปเค้กห้องเรียน
                      </span>
                    </button>
                  </Link>
                </>
              )}

              {/* User Dropdown - Improved */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-md px-4 py-3 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg group">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                      {loggedInUsername?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold leading-tight">
                        {loggedInUsername}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center cursor-pointer space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40">
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Toggle Button - Moved outside header */}
      <button
        onClick={toggleNavbar}
        className="fixed top-0 right-4 bg-blue-700 text-white p-1 rounded-b-lg shadow-lg focus:outline-none z-50"
      >
        {isNavbarHidden ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronUp className="w-5 h-5" />
        )}
      </button>
    </>
  );
};

export default Navbar;

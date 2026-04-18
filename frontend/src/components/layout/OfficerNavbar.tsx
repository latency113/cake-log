import React from "react";
import { Link } from "@tanstack/react-router";
import { Clock, LogOut, Package } from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";

interface OfficerNavbarProps {
  handleLogout: () => void;
}

const OfficerNavbar: React.FC<OfficerNavbarProps> = ({ handleLogout }) => {
  return (
    <div className="bg-background fixed top-0 left-0 right-0 shadow-sm flex justify-between items-center h-16 px-4 border-b z-50">
      <div className="flex items-center space-x-4">
        <Link
          to="/officer-prepare"
          className="flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"
          activeProps={{
            className: "flex items-center justify-center text-blue-500",
          }}
        >
          {({ isActive }: { isActive: boolean }) => (
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
                isActive ? "text-blue-500" : ""
              }`}
            >
              <Clock className={isActive ? "text-blue-500" : ""} size={24} />
              <span className="text-sm ml-2">รายการวันนี้</span>
            </button>
          )}
        </Link>
        <Link
          to="/officer-orders-all"
          className="flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"
          activeProps={{
            className: "flex items-center justify-center text-blue-500",
          }}
        >
          {({ isActive }: { isActive: boolean }) => (
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
                isActive ? "text-blue-500" : ""
              }`}
            >
              <Package className={isActive ? "text-blue-500" : ""} size={24} />
              <span className="text-sm ml-2">รายการทั้งหมด</span>
            </button>
          )}
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut size={24} />
          <span className="text-sm ml-2">ออกจากระบบ</span>
        </button>
        <ModeToggle />
      </div>
    </div>
  );
};

export default OfficerNavbar;
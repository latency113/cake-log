import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../theme/mode-toggle";

const OfficerSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate({ to: "/login" });
  };

  return (
    <aside className="w-64 bg-background text-foreground flex flex-col border-r border-border">
      {/* Header Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">
              ฝ่ายจ่ายเค้ก
            </h2>
            <p className="text-sm text-muted-foreground">
              NVC Cake Management
            </p>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">
            เมนู
          </h3>
          <ul>
            <li>
              <Link
                to="/officer-orders"
                activeProps={{
                  className: "bg-muted text-foreground",
                }}
                activeOptions={{
                  exact: true,
                }}
                className="flex items-center space-x-3 py-2 px-3 rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-medium">แสดงสถานะออเดอร์</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-muted-foreground border-border hover:bg-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  );
};

export default OfficerSidebar;
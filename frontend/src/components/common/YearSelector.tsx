import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { getAvailableYears, getSystemActiveYear } from "@/utils/api/settings";

export const YearSelector: React.FC = () => {
  const [year, setYear] = useState<string>("2569");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const [years, status] = await Promise.all([
          getAvailableYears(),
          getSystemActiveYear()
        ]);
        setAvailableYears(years);
        
        const stored = localStorage.getItem("academicYear");
        const serverYear = status.academicYear;

        if (stored && years.includes(stored)) {
          setYear(stored);
        } else if (serverYear && years.includes(serverYear)) {
          setYear(serverYear);
          localStorage.setItem("academicYear", serverYear);
        } else if (years.length > 0) {
          setYear(years[0]);
          localStorage.setItem("academicYear", years[0]);
        }
      } catch (error) {
        console.error("Failed to load years", error);
      }
    };

    fetchYears();
  }, []);

  const handleChange = (value: string) => {
    if (value === "system-default") {
      localStorage.removeItem("academicYear");
      sessionStorage.removeItem("academicYearManual");
    } else {
      setYear(value);
      localStorage.setItem("academicYear", value);
      // Mark as manual change to prevent main.tsx from syncing it back to server default in this session
      sessionStorage.setItem("academicYearManual", "true");
    }
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2 bg-white/10 px-2 py-1 rounded-lg border border-white/20 backdrop-blur-sm">
      <Calendar className="w-4 h-4 text-gray-500" />
      <Select value={year} onValueChange={handleChange}>
        <SelectTrigger className="w-[120px] h-9 bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="ปี" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system-default" className="font-semibold text-blue-600">
            ใช้ตามระบบ
          </SelectItem>
          {availableYears.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
          {availableYears.length === 0 && (
             <SelectItem value="2569">2569</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

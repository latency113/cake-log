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

export const YearSelector: React.FC<{ className?: string }> = ({ className }) => {
  const [year, setYear] = useState<string>("2569");
  const [systemActiveYear, setSystemActiveYear] = useState<string>("2569");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const [years, status] = await Promise.all([
          getAvailableYears(),
          getSystemActiveYear(),
        ]);
        setAvailableYears(years);

        const serverYear = status.academicYear || "2569";
        setSystemActiveYear(serverYear);

        const stored = localStorage.getItem("academicYear");

        if (stored && years.includes(stored)) {
          setYear(stored);
        } else {
          setYear(serverYear);
          localStorage.setItem("academicYear", serverYear);
        }
      } catch (error) {
        console.error("Failed to load years", error);
      }
    };

    fetchYears();
  }, []);

  const handleChange = (value: string) => {
    setYear(value);
    localStorage.setItem("academicYear", value);
    if (value === systemActiveYear) {
      sessionStorage.removeItem("academicYearManual");
    } else {
      sessionStorage.setItem("academicYearManual", "true");
    }
    window.location.reload();
  };

  return (
    <Select value={year} onValueChange={handleChange}>
      <SelectTrigger
        className={`h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs gap-2 min-w-[170px] ${
          className || ""
        }`}
      >
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <SelectValue placeholder="เลือกปีการศึกษา">
          <div className="flex items-center gap-1.5">
            <span>ปี {year}</span>
            {year === systemActiveYear ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold leading-none">
                ปัจจุบัน
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold leading-none">
                ย้อนหลัง
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[170px]">
        {availableYears.map((y) => {
          const isCurrent = y === systemActiveYear;
          return (
            <SelectItem key={y} value={y} className="text-xs cursor-pointer py-2">
              <div className="flex items-center justify-between w-full gap-2">
                <span>ปี {y}</span>
                {isCurrent ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    ปัจจุบัน
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                    ย้อนหลัง
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
        {availableYears.length === 0 && (
          <SelectItem value="2569" className="text-xs">
            ปี 2569 (ปัจจุบัน)
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

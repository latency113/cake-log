import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
  type InteractionMode,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { getDepartmentColor } from "@/utils/chart-colors";
import type { DepartmentCakeQuantity } from "@/types/department";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface DepartmentCakeQuantityChartProps {
  departmentCakeQuantities: DepartmentCakeQuantity[];
}

const DepartmentCakeQuantityChart: React.FC<
  DepartmentCakeQuantityChartProps
> = ({ departmentCakeQuantities }) => {
  const [chartTextColor, setChartTextColor] = useState("#475569");
  const [gridColor, setGridColor] = useState("rgba(148, 163, 184, 0.1)");
  const [tooltipBgColor, setTooltipBgColor] = useState("rgba(15, 23, 42, 0.9)");
  const [tooltipTextColor, setTooltipTextColor] = useState("#f8fafc");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    const style = getComputedStyle(document.documentElement);
    setChartTextColor(
      style.getPropertyValue("--foreground").trim() || "#475569"
    );
    setGridColor(
      style.getPropertyValue("--border").trim() || "rgba(148, 163, 184, 0.1)"
    );
    setTooltipBgColor(
      style.getPropertyValue("--card").trim() || "rgba(15, 23, 42, 0.9)"
    );
    setTooltipTextColor(
      style.getPropertyValue("--card-foreground").trim() || "#f8fafc"
    );

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = {
    labels: departmentCakeQuantities.map((data) => data.name),
    datasets: [
      {
        label: "จำนวนเค้กทั้งหมด",
        data: departmentCakeQuantities.map((data) => data.totalQuantity),
        backgroundColor: departmentCakeQuantities.map(data => getDepartmentColor(data.name)),
        borderColor: departmentCakeQuantities.map(data => getDepartmentColor(data.name)),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    indexAxis: (isMobile ? 'y' : 'x') as 'x' | 'y',
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as InteractionMode,
    },
    layout: {
      padding: {
        right: isMobile ? 40 : 10,
        top: isMobile ? 10 : 30,
      }
    },
    plugins: {
      legend: {
        display: !isMobile,
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
            family: "Noto Sans Thai",
            weight: 500,
          },
          color: chartTextColor,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBgColor,
        titleColor: tooltipTextColor,
        bodyColor: tooltipTextColor,
        borderColor: "rgba(75, 192, 192, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600,
          family: "Noto Sans Thai",
        },
        bodyFont: {
          size: 13,
          family: "Noto Sans Thai",
        },
        callbacks: {
          title: function (context: TooltipItem<"bar">[]) {
            return `แผนก: ${context[0].label}`;
          },
          label: function (context: TooltipItem<"bar">) {
            return `จำนวน: ${context.parsed[isMobile ? 'x' : 'y']} ชิ้น`;
          },
        },
      },
      datalabels: {
        display: true,
        color: chartTextColor,
        anchor: 'end' as const,
        align: 'end' as const,
        offset: 4,
        formatter: function(value: number) {
          return new Intl.NumberFormat("th-TH").format(value);
        },
        font: {
          size: isMobile ? 10 : 11,
          weight: 'bold' as const,
          family: "Noto Sans Thai",
        },
        backgroundColor: isMobile ? undefined : 'rgba(255, 255, 255, 0.8)',
        borderRadius: 4,
        padding: 4,
      },

    },
    scales: {
      x: {
        display: true,
        grid: {
          display: isMobile,
          color: gridColor,
        },
        ticks: {
          color: chartTextColor,
          font: {
            size: isMobile ? 10 : 12,
            family: "Noto Sans Thai",
          },
          padding: 8,
          maxRotation: isMobile ? 0 : 45,
          minRotation: isMobile ? 0 : 0,
        },
        title: {
          display: !isMobile,
          text: isMobile ? "จำนวนชิ้น" : "แผนก",
          color: chartTextColor,
          font: {
            size: 14,
            weight: 600,
            family: "Noto Sans Thai",
          },
          padding: {
            top: 10,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: !isMobile,
          color: gridColor,
        },
        ticks: {
          color: chartTextColor,
          font: {
            size: isMobile ? 10 : 12,
            family: "Noto Sans Thai",
          },
          padding: 8,
          callback: function (tickValue: string | number) {
            if (isMobile) return tickValue;
            return `${tickValue} ชิ้น`;
          },
        },
        title: {
          display: !isMobile,
          text: isMobile ? "แผนก" : "จำนวนชิ้น",
          color: chartTextColor,
          font: {
            size: 14,
            weight: 600,
            family: "Noto Sans Thai",
          },
          padding: {
            bottom: 10,
          },
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuart" as const,
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
          กราฟจำนวนชิ้นแต่ละแผนก
        </h2>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span>แยกตามแผนก</span>
        </div>
      </div>

      <div className="flex-1 min-h-[350px] relative">
        {departmentCakeQuantities.length > 0 ? (
          <Bar data={chartData} options={chartOptions as any} plugins={[ChartDataLabels]} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 font-medium">ไม่มีข้อมูลจำนวนเค้ก</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentCakeQuantityChart;

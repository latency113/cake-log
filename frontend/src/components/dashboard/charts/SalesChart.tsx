import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type InteractionMode,
} from "chart.js";
import type { DashboardSummary } from "@/types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  dailyPounds: DashboardSummary["dailyPounds"];
}

const SalesChart: React.FC<SalesChartProps> = ({ dailyPounds }) => {
  const [chartTextColor, setChartTextColor] = useState("#475569");
  const [gridColor, setGridColor] = useState("rgba(148, 163, 184, 0.1)");
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

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rawDates = dailyPounds.map((data) => data.date);
  const formattedDates = rawDates.map((date) =>
    new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    })
  );

  const chartData = {
    labels: formattedDates,
    datasets: [
      {
        label: "จำนวนปอนด์รวม",
        data: dailyPounds.map((data) => data.pounds),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: isMobile ? 2 : 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: isMobile ? 1 : 2,
        pointRadius: isMobile ? 4 : 6,
        pointHoverRadius: isMobile ? 6 : 8,
        pointHoverBackgroundColor: "rgb(37, 99, 235)",
        pointHoverBorderColor: "rgb(255, 255, 255)",
        pointHoverBorderWidth: isMobile ? 2 : 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as InteractionMode,
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
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          family: "Noto Sans Thai",
        },
        bodyFont: {
          size: 13,
          family: "Noto Sans Thai",
        },
        callbacks: {
          title: function (context: import("chart.js").TooltipItem<"line">[]) {
            const index = context[0].dataIndex;
            const rawDate = rawDates[index];
            return `วันที่: ${new Date(rawDate).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`;
          },
          label: function (context: import("chart.js").TooltipItem<"line">) {
            const value = new Intl.NumberFormat("th-TH").format(
              context.parsed.y
            );
            return `จำนวนปอนด์: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: chartTextColor,
          font: {
            size: isMobile ? 10 : 12,
            family: "Noto Sans Thai",
          },
          maxTicksLimit: isMobile ? 6 : 10,
          padding: 8,
          maxRotation: isMobile ? 45 : 0,
        },
        title: {
          display: !isMobile,
          text: "วันที่",
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
          display: true,
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
            const val = tickValue as number;
            if (isMobile && val >= 1000) {
              return (val / 1000).toFixed(1) + 'k';
            }
            return new Intl.NumberFormat("th-TH").format(val);
          },
        },
        title: {
          display: !isMobile,
          text: "จำนวนปอนด์",
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
    elements: {
      line: {
        borderJoinStyle: "round" as const,
        borderCapStyle: "round" as const,
      },
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuart" as const,
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
          กราฟจำนวนปอนด์รวมตามวัน
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] relative">
        {dailyPounds.length > 0 ? (
          <div className="absolute inset-0">
            <Line data={chartData} options={chartOptions as any} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 font-medium">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;

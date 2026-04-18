import React, { useState, useEffect, useMemo } from "react";
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
  Filler,
  type InteractionMode,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { DashboardSummary } from "@/types/dashboard";
import { TrendingUp, CalendarDays } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

interface SalesChartProps {
  dailyPounds: DashboardSummary["dailyPounds"];
}

const SalesChart: React.FC<SalesChartProps> = ({ dailyPounds }) => {
  const [chartTextColor, setChartTextColor] = useState("#94a3b8");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rawDates = dailyPounds.map((data) => data.date);
  const formattedDates = useMemo(() => 
    rawDates.map((date) =>
      new Date(date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      })
    ), [rawDates]);

  const chartData = {
    labels: formattedDates,
    datasets: [
      {
        label: "จำนวนปอนด์",
        data: dailyPounds.map((data) => data.pounds),
        borderColor: "#3b82f6", // blue-500
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.08)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
        borderWidth: 3.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2.5,
        pointRadius: 4.5,
        pointHoverRadius: 6.5,
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30, // Space for datalabels
        bottom: 10,
        left: 0,
        right: 15
      }
    },
    interaction: {
      intersect: false,
      mode: "index" as InteractionMode,
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        align: 'top' as const,
        anchor: 'end' as const,
        offset: 8,
        color: '#475569',
        font: {
          family: '"Noto Sans Thai", sans-serif',
          size: 11,
          weight: '800' as const,
        },
        formatter: (value: number) => value > 0 ? value.toLocaleString() : '',
        display: (context: any) => !isMobile || context.dataIndex % 2 === 0, 
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: '700', family: '"Noto Sans Thai", sans-serif' },
        bodyFont: { size: 13, weight: '500', family: '"Noto Sans Thai", sans-serif' },
        usePointStyle: true,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return new Date(rawDates[index]).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          },
          label: (context: any) => ` ยอดสั่งซื้อ: ${context.parsed.y.toLocaleString()} ปอนด์`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        title: {
          display: true,
          text: "วันที่",
          color: "#94a3b8",
          font: {
            size: 12,
            weight: '500',
            family: '"Noto Sans Thai", sans-serif',
          },
          padding: { top: 10 }
        },
        ticks: {
          color: chartTextColor,
          font: { size: 10, weight: '600', family: '"Noto Sans Thai", sans-serif' },
          maxTicksLimit: isMobile ? 6 : 15,
          padding: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(241, 245, 249, 0.6)",
          drawTicks: false,
        },
        border: { display: false },
        title: {
          display: true,
          text: "จำนวนปอนด์",
          color: "#94a3b8",
          font: {
            size: 12,
            weight: '500',
            family: '"Noto Sans Thai", sans-serif',
          },
          padding: { bottom: 10 }
        },
        ticks: {
          color: chartTextColor,
          font: { size: 10, weight: '600', family: '"Noto Sans Thai", sans-serif' },
          padding: 10,
          maxTicksLimit: 6,
          callback: (value: any) => value.toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-sm shadow-lg border border-border p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              แนวโน้มยอดปอนด์รายวัน
            </h2>
            <div className="flex items-center text-slate-400 gap-1.5 mt-0.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <p className="text-xs font-medium uppercase tracking-wider">สรุปตามวันที่รับเค้ก</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
          <span className="text-[10px]  text-slate-500 uppercase tracking-widest">
            ยอดปอนด์รวม
          </span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[350px] w-full">
        {dailyPounds.length > 0 ? (
          <Line data={chartData} options={chartOptions as any} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold italic text-sm">ยังไม่มีข้อมูลสถิติ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;

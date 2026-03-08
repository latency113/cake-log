import type { Order } from "../types";
import { CheckCircle, Clock, Package, Calendar } from "lucide-react";
import React from "react";

export interface TimelineStep {
  key: string;
  label: string;
  date: string;
  completed: boolean;
  active: boolean;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

export const getTimelineSteps = (order: Order): TimelineStep[] => {
  const steps: TimelineStep[] = [
    {
      key: "created",
      label: "บันทึกออเดอร์",
      date: new Date(order.createdAt).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      completed: true, // Always completed once created
      active: false,
      icon: <Calendar className="w-4 h-4" />,
      color: order.status === "pending" ? "bg-blue-500" : "bg-slate-600",
      borderColor: order.status === "pending" ? "bg-blue-500" : "bg-slate-600"                                                                                                                                                                                                                                                                                                                                                                                                        ,
    },
    {
      key: "pending",
      label: "รอจัดเตรียม",
      date: order.status === "pending" ? "กำลังดำเนินการ" : "",
      completed: ["approved", "complete"].includes(order.status),
      active: order.status === "pending",
      icon: <Clock className="w-4 h-4" />,
      color: order.status === "pending" ? "bg-amber-500" : "bg-slate-600",
      borderColor: order.status === "pending" ? "border-amber-500" : "border-slate-600",
    },
    {
      key: "approved",
      label: "พร้อมจัดส่ง",
      date: order.status === "approved" ? "พร้อมแล้ว" : "",
      completed: order.status === "complete",
      active: order.status === "approved",
      icon: <Package className="w-4 h-4" />,
      color: order.status === "approved" ? "bg-indigo-500" : "bg-slate-600",
      borderColor: order.status === "approved" ? "border-indigo-500" : "border-slate-600",
    },
    {
      key: "complete",
      label: "ส่งมอบเรียบร้อย",
      date: order.status === "complete" ? new Date(order.updatedAt).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) : "",
      completed: order.status === "complete",
      active: order.status === "complete",
      icon: <CheckCircle className="w-4 h-4" />,
      color: order.status === "complete" ? "bg-green-500" : "bg-slate-600",
      borderColor: order.status === "complete" ? "border-green-500" : "border-slate-600",
    },
  ];

  return steps;
};

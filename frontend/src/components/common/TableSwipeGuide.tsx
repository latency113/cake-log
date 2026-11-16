import React from "react";
import { Hand, ChevronsLeft, MoveHorizontal } from "lucide-react";

interface TableSwipeGuideProps {
  showGuide: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export const TableSwipeGuide: React.FC<TableSwipeGuideProps> = ({
  showGuide,
  onClose,
  title = "เลื่อนนิ้วไปทางซ้าย",
  description = "ตารางมีข้อมูลหลายคอลัมน์\nปัดไปทางซ้ายเพื่อดูรายละเอียดทั้งหมด",
  buttonText = "แตะที่ใดก็ได้เพื่อเริ่มใช้งาน",
}) => {
  if (!showGuide) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white cursor-pointer select-none md:hidden"
    >
      <style>{`
        @keyframes fullSwipeLeft {
          0% {
            transform: translateX(35px);
            opacity: 0.35;
          }
          50% {
            transform: translateX(-35px);
            opacity: 1;
          }
          100% {
            transform: translateX(35px);
            opacity: 0.35;
          }
        }
        .animate-full-swipe-left {
          animation: fullSwipeLeft 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Hand Gesture */}
      <div className="relative mb-6 flex items-center justify-center w-28 h-28">
        <div className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping" />
        <div className="animate-full-swipe-left">
          <div className="p-4 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl">
            <Hand className="w-14 h-14 text-white drop-shadow -rotate-12" />
          </div>
        </div>
      </div>

      {/* Chevrons pointing left */}
      <div className="flex items-center gap-2 mb-3 text-blue-400">
        <ChevronsLeft className="w-6 h-6 animate-pulse" />
        <span className="text-xs font-bold tracking-widest uppercase">SWIPE LEFT</span>
        <ChevronsLeft className="w-6 h-6 animate-pulse" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold mb-2 text-center text-white drop-shadow">
        {title}
      </h3>
      <p className="text-sm text-gray-200 text-center max-w-xs mb-8 leading-relaxed whitespace-pre-line">
        {description}
      </p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="px-6 py-2.5 rounded-full bg-white text-gray-900 font-semibold text-sm shadow-xl active:scale-95 transition-transform"
      >
        {buttonText}
      </button>
    </div>
  );
};


export const TableDesktopHint: React.FC<{ className?: string; text?: string }> = ({
  className = "",
  text = "เลื่อนซ้าย-ขวาเพื่อดูข้อมูลเพิ่มเติม",
}) => (
  <span
    className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-normal text-muted-foreground bg-muted/70 rounded-full border border-border/60 ${className}`}
  >
    <MoveHorizontal className="w-3.5 h-3.5 text-blue-500" />
    {text}
  </span>
);

export const TableMobileSwipeBanner: React.FC<{
  onOpenGuide?: () => void;
  text?: string;
}> = ({
  onOpenGuide,
  text = "เลื่อนนิ้วไปทางซ้ายเพื่อดูข้อมูลในตารางเพิ่มเติม",
}) => (
  <div
    onClick={onOpenGuide}
    className={`md:hidden px-4 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-b border-border/60 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 ${
      onOpenGuide ? "cursor-pointer active:opacity-80" : ""
    }`}
  >
    <div className="flex items-center gap-2 font-medium">
      <Hand className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      <span>{text}</span>
    </div>
    <ChevronsLeft className="w-4 h-4 opacity-70 animate-pulse" />
  </div>
);

export default TableSwipeGuide;

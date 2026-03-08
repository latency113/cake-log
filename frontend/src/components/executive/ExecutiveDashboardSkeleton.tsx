import React from "react";
import SkeletonLoader from "../common/SkeletonLoader";

const ExecutiveDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-40" />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
        <SkeletonLoader width="w-1/3" height="h-7" className="mb-8" />
        <SkeletonLoader height="h-80" />
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <SkeletonLoader width="w-1/2" height="h-7" className="mb-8" />
          <SkeletonLoader height="h-80" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <SkeletonLoader width="w-1/2" height="h-7" className="mb-8" />
          <SkeletonLoader height="h-80" />
        </div>
      </div>

      {/* Team Leaderboard Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
        <SkeletonLoader width="w-1/4" height="h-8" className="mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 h-16"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardSkeleton;

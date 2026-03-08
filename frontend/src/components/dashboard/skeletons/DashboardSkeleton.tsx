import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-11/12 mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
        <SkeletonLoader width="w-3/4" height="h-8" className="mb-4" />
        <SkeletonLoader width="w-1/2" height="h-5" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-xl shadow-lg p-8 h-40" />
        ))}
      </div>

      {/* Chart Section Skeleton */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
        <SkeletonLoader height="h-80" />
      </div>

      {/* Sales Records Table Skeleton */}
                  <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
                    <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        <div className="bg-muted h-12 rounded-t-lg mb-2" /> {/* Table Header */} 
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="bg-secondary h-10 mb-1 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </div>      {/* Department Sales Leaderboard Skeleton */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border h-20" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

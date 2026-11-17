import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-11/12 mx-auto animate-pulse pb-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-5 gap-4">
        <div>
          <SkeletonLoader width="w-64" height="h-9" className="mb-2" />
          <SkeletonLoader width="w-96" height="h-5" />
        </div>
        <div className="bg-card px-5 py-3 rounded-2xl border border-border w-48 h-14" />
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-sm shadow-md p-6 h-36" />
        ))}
      </div>

      {/* Row 2 Skeleton: Chart + Top Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 bg-card rounded-sm shadow-md border border-border p-6 h-96">
          <SkeletonLoader width="w-48" height="h-6" className="mb-6" />
          <SkeletonLoader height="h-72" />
        </div>
        <div className="lg:col-span-5 bg-card rounded-sm shadow-md border border-border p-6 h-96">
          <SkeletonLoader width="w-40" height="h-6" className="mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-12" />
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 Skeleton: Cake Flavor Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-card rounded-sm shadow-md border border-border p-6 h-72">
          <SkeletonLoader width="w-64" height="h-6" className="mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-8" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 bg-card rounded-sm shadow-md border border-border p-6 h-72">
          <SkeletonLoader width="w-48" height="h-6" className="mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

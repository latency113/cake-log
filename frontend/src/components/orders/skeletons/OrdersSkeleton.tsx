import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const OrdersSkeleton: React.FC = () => {
  return (
    <div className="max-w-11/12 mx-auto animate-pulse p-4">
      {/* Header Skeleton */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <SkeletonLoader width="w-48" height="h-8" />
          <SkeletonLoader width="w-64" height="h-4" />
          <div className="flex gap-4 pt-2">
            <SkeletonLoader width="w-32" height="h-6" />
            <SkeletonLoader width="w-24" height="h-6" />
            <SkeletonLoader width="w-28" height="h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="bg-card rounded-t-lg shadow-lg border border-border p-4">
        <div className="animate-pulse flex items-center justify-between">
          <div className="flex gap-3">
            <SkeletonLoader width="w-40" height="h-10" />
            <SkeletonLoader width="w-32" height="h-10" />
            <SkeletonLoader width="w-24" height="h-10" />
          </div>
          <div className="flex gap-2">
            <SkeletonLoader width="w-28" height="h-10" />
            <SkeletonLoader width="w-20" height="h-10" />
          </div>
        </div>
      </div>

      {/* Orders Table Skeleton */}
      <div className="bg-card shadow-lg border border-border overflow-hidden">
        {/* Table Title */}
        <div className="p-4 border-b border-border animate-pulse">
          <SkeletonLoader width="w-40" height="h-6" />
        </div>

        {/* Table Header */}
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <div className="animate-pulse grid grid-cols-8 gap-4">
            <SkeletonLoader width="w-16" height="h-4" />
            <SkeletonLoader width="w-20" height="h-4" />
            <SkeletonLoader width="w-24" height="h-4" />
            <SkeletonLoader width="w-18" height="h-4" />
            <SkeletonLoader width="w-20" height="h-4" />
            <SkeletonLoader width="w-16" height="h-4" />
            <SkeletonLoader width="w-20" height="h-4" />
            <SkeletonLoader width="w-16" height="h-4" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-4">
              <div className="animate-pulse grid grid-cols-8 gap-4 items-center">
                <SkeletonLoader width="w-12" height="h-4" />
                <SkeletonLoader width="w-full" height="h-4" />
                <div className="space-y-1">
                  <SkeletonLoader width="w-full" height="h-3" />
                  <SkeletonLoader width="w-3/4" height="h-3" />
                </div>
                <SkeletonLoader width="w-14" height="h-4" />
                <SkeletonLoader width="w-16" height="h-4" />
                <div className="flex justify-center">
                  <SkeletonLoader width="w-16" height="h-6" className="rounded-full" />
                </div>
                <SkeletonLoader width="w-20" height="h-4" />
                <div className="flex gap-1">
                  <SkeletonLoader width="w-6" height="h-6" className="rounded" />
                  <SkeletonLoader width="w-6" height="h-6" className="rounded" />
                  <SkeletonLoader width="w-6" height="h-6" className="rounded" />
                </div>
              </div>
              
              {/* Additional row details */}
              <div className="animate-pulse mt-2 space-y-1">
                <div className="flex gap-4 text-xs">
                  <SkeletonLoader width="w-20" height="h-3" />
                  <SkeletonLoader width="w-24" height="h-3" />
                  <SkeletonLoader width="w-18" height="h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="bg-muted/30 px-4 py-3 border-t border-border">
          <div className="animate-pulse flex items-center justify-between">
            <SkeletonLoader width="w-32" height="h-4" />
            <div className="flex gap-2">
              <SkeletonLoader width="w-20" height="h-8" className="rounded" />
              <SkeletonLoader width="w-8" height="h-8" className="rounded" />
              <SkeletonLoader width="w-8" height="h-8" className="rounded" />
              <SkeletonLoader width="w-8" height="h-8" className="rounded" />
              <SkeletonLoader width="w-20" height="h-8" className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSkeleton;
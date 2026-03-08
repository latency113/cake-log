import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-11/12 mx-auto animate-pulse p-4">
      <SkeletonLoader width="w-1/2" height="h-8" className="mb-6" />
      <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
        <SkeletonLoader height="h-80" />
      </div>
      <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
        <SkeletonLoader height="h-80" />
      </div>
      {/* Department Sales Leaderboard Skeleton */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border h-20" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSkeleton;

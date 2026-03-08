import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const UsersTableSkeleton: React.FC = () => {
  return (
    <div className="rounded-sm border shadow-md p-4 bg-white">
      <div className="space-y-4">
        {/* Header-like skeleton */}
        <SkeletonLoader width="100%" height="h-12" className="mb-4" />
        
        {/* Row skeletons */}
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonLoader 
            key={index} 
            width="100%" 
            height="h-16" 
            className="mb-2"
          />
        ))}
      </div>
    </div>
  );
};

export default UsersTableSkeleton;

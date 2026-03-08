import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const UsersSkeleton: React.FC = () => {
  return (
    <div className="max-w-11/12 mx-auto animate-pulse p-4">
      <div className="bg-card rounded-xl shadow-lg border border-border p-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
      </div>
      <div className="bg-card rounded-xl shadow-lg border border-border p-8 my-8">
        <SkeletonLoader width="w-2/3" height="h-7" className="mb-6" />
        <SkeletonLoader height="h-80" />
      </div>
    </div>
  );
};

export default UsersSkeleton;

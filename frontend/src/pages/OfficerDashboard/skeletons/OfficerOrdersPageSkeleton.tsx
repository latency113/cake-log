import SkeletonLoader from "../../../components/common/SkeletonLoader";

export default function OfficerOrdersPageSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Title */} 
      <SkeletonLoader width="w-1/2" height="h-10" className="mb-6" />

      {/* List of Order Cards */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-200 shadow-md rounded-md p-4 space-y-3">
            <SkeletonLoader width="w-3/4" height="h-6" />
            <SkeletonLoader width="w-full" height="h-4" />
            <SkeletonLoader width="w-1/2" height="h-4" />
            <SkeletonLoader width="w-1/3" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

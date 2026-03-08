import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function UsersSkeleton() {
  return (
    <div className="max-w-11/12 mx-auto p-4 space-y-6">
      {/* Header Section */} 
      <div className="rounded-sm shadow-md p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <SkeletonLoader className="h-10 w-64 mb-2" />
            <SkeletonLoader className="h-6 w-48" />
          </div>
          <SkeletonLoader className="h-10 w-36" />
        </div>
      </div>

      {/* Table-like structure */} 
      <div className="border border-gray-200 shadow-md rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <SkeletonLoader className="h-6 w-1/5" />
          <SkeletonLoader className="h-6 w-1/5" />
          <SkeletonLoader className="h-6 w-1/5" />
          <SkeletonLoader className="h-6 w-1/5" />
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <SkeletonLoader className="h-5 w-1/5" />
              <SkeletonLoader className="h-5 w-1/5" />
              <SkeletonLoader className="h-5 w-1/5" />
              <SkeletonLoader className="h-5 w-1/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */} 
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-8 w-32" />
        <SkeletonLoader className="h-8 w-24" />
      </div>
    </div>
  );
}

import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function SalesRecordsPageSkeleton() {
  return (
    <div className="max-w-11/12 p-4 space-y-4">
      {/* Print Button */} 
      <SkeletonLoader className="h-10 w-24" />

      {/* Table-like structure */} 
      <div className="border border-gray-200 shadow-md rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <SkeletonLoader className="h-6 w-1/6" />
          <SkeletonLoader className="h-6 w-1/6" />
          <SkeletonLoader className="h-6 w-1/6" />
          <SkeletonLoader className="h-6 w-1/6" />
          <SkeletonLoader className="h-6 w-1/6" />
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <SkeletonLoader className="h-5 w-1/6" />
              <SkeletonLoader className="h-5 w-1/6" />
              <SkeletonLoader className="h-5 w-1/6" />
              <SkeletonLoader className="h-5 w-1/6" />
              <SkeletonLoader className="h-5 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

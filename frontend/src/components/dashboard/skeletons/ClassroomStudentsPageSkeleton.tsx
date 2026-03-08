import SkeletonLoader from "@/components/common/SkeletonLoader";


export default function ClassroomStudentsPageSkeleton() {
  return (
    <div className="container mx-auto max-w-11/12 p-4 space-y-4">
      <SkeletonLoader className="h-10 w-48 mb-4" /> {/* Button */} 
      <SkeletonLoader className="h-10 w-3/4 mb-6" /> {/* H1 Title */} 

      {/* Table-like structure */} 
      <div className="border border-gray-200 shadow-md rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <SkeletonLoader className="h-6 w-1/4" />
          <SkeletonLoader className="h-6 w-1/4" />
          <SkeletonLoader className="h-6 w-1/4" />
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <SkeletonLoader className="h-5 w-1/5" />
              <SkeletonLoader className="h-5 w-2/5" />
              <SkeletonLoader className="h-5 w-1/5" />
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-4 flex justify-end items-center">
          <SkeletonLoader className="h-6 w-1/3" />
        </div>
      </div>
    </div>
  );
}

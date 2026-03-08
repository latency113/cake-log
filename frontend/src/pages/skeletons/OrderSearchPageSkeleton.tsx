import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function OrderSearchPageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonLoader className="h-12 w-1/3" />
      <div className="flex space-x-4">
        <SkeletonLoader className="h-10 w-1/2" />
        <SkeletonLoader className="h-10 w-1/4" />
      </div>
      <div className="space-y-2">
        <SkeletonLoader className="h-20 w-full" />
        <SkeletonLoader className="h-20 w-full" />
        <SkeletonLoader className="h-20 w-full" />
      </div>
      <SkeletonLoader className="h-10 w-32" />
    </div>
  );
}

import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function OrdersSkeleton() {
  return (
    <div className="max-w-11/12 space-y-4 p-4">
      <SkeletonLoader className="h-12 w-1/4" />
      <div className="flex space-x-4">
        <SkeletonLoader className="h-10 w-1/3" />
        <SkeletonLoader className="h-10 w-1/3" />
        <SkeletonLoader className="h-10 w-1/3" />
      </div>
      <SkeletonLoader className="h-48 w-full" />
      <div className="flex justify-between">
        <SkeletonLoader className="h-8 w-24" />
        <SkeletonLoader className="h-8 w-24" />
      </div>
    </div>
  );
}

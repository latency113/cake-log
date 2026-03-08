import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function HomeSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonLoader className="h-12 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonLoader className="h-48 w-full" />
        <SkeletonLoader className="h-48 w-full" />
        <SkeletonLoader className="h-48 w-full" />
      </div>
      <SkeletonLoader className="h-24 w-full" />
    </div>
  );
}

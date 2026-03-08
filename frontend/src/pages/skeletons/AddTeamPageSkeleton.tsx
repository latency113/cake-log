import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function AddTeamPageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonLoader className="h-10 w-1/4" />
      <SkeletonLoader className="h-8 w-1/2" />
      <div className="space-y-2">
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-3/4" />
      </div>
      <SkeletonLoader className="h-10 w-32" />
    </div>
  );
}

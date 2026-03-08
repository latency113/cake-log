import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function LoginSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <SkeletonLoader className="h-16 w-1/2 mb-8" />
      <div className="space-y-4 w-full max-w-md">
        <SkeletonLoader className="h-10 w-full" />
        <SkeletonLoader className="h-10 w-full" />
        <SkeletonLoader className="h-10 w-full" />
      </div>
      <SkeletonLoader className="h-4 w-1/4 mt-4" />
    </div>
  );
}

import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function WelcomePageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <SkeletonLoader className="h-20 w-2/3 mb-8" />
      <SkeletonLoader className="h-10 w-1/2 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <SkeletonLoader className="h-32 w-full" />
        <SkeletonLoader className="h-32 w-full" />
        <SkeletonLoader className="h-32 w-full" />
        <SkeletonLoader className="h-32 w-full" />
      </div>
    </div>
  );
}

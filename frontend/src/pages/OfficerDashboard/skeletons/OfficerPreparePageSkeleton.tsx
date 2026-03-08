import SkeletonLoader from "../../../components/common/SkeletonLoader";

export default function OfficerPreparePageSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header Skeleton */}
      <div className="sticky top-0 z-20 bg-background backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          {/* H1 Title */}
          <SkeletonLoader width="w-48" height="h-6" className="mb-3" />
          
          {/* Badge */}
          <div className="flex items-center gap-2">
            <SkeletonLoader width="w-24" height="h-7" />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="space-y-6">
          {/* Grouped Order Cards */}
          {[...Array(2)].map((_, dateIndex) => (
            <div key={dateIndex}>
              {/* Date Header - Sticky */}
              <div className="sticky top-[73px] z-10 bg-background backdrop-blur-sm py-3 -mx-4 px-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-muted rounded-full" />
                  <SkeletonLoader width="w-32" height="h-5" className="flex-1" />
                  <SkeletonLoader width="w-8" height="h-6" />
                  <SkeletonLoader width="w-5" height="h-5" />
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SkeletonLoader width="w-10" height="h-10" />
                          <div className="space-y-2">
                            <SkeletonLoader width="w-32" height="h-4" />
                            <SkeletonLoader width="w-24" height="h-3" />
                          </div>
                        </div>
                        <SkeletonLoader width="w-20" height="h-7" />
                      </div>

                      {/* Compact Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <SkeletonLoader width="w-24" height="h-3" />
                          <SkeletonLoader width="w-28" height="h-3" />
                        </div>
                        <SkeletonLoader width="w-16" height="h-5" />
                      </div>
                    </div>

                    {/* Expand Button */}
                    <div className="px-4 py-2 bg-muted/50 border-t border-border">
                      <SkeletonLoader width="w-32" height="h-4" className="mx-auto" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              {dateIndex < 1 && (
                <div className="mt-6 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <SkeletonLoader width="w-full" height="h-16" />
      </div>
    </div>
  );
}
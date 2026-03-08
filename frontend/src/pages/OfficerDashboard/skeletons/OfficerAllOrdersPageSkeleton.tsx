import SkeletonLoader from "../../../components/common/SkeletonLoader";

export default function OfficerAllOrdersPageSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 pb-20 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonLoader width="w-2/4" height="h-8" className="mb-2" /> {/* H1 title */}
          <div className="flex items-center gap-2">
            <SkeletonLoader width="w-32" height="h-6" className="rounded-full" /> {/* Stats badge */}
          </div>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="mb-6 space-y-3">
        {/* Search and Date Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Bar */}
          <SkeletonLoader width="w-full" height="h-14" className="rounded-xl flex-1" /> {/* Search Input */}
          {/* Date Preset Dropdown */}
          <SkeletonLoader width="sm:w-64" height="h-14" className="rounded-xl" /> {/* Date Preset */}
        </div>
      </div>

      {/* Orders Table Skeleton */}
      <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <SkeletonLoader width="w-1/4" height="h-6" /> {/* CardTitle text */}
            <SkeletonLoader width="w-20" height="h-6" className="rounded-full" /> {/* Badge */}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <SkeletonLoader width="w-16" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <SkeletonLoader width="w-20" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  <SkeletonLoader width="w-20" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  <SkeletonLoader width="w-16" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  <SkeletonLoader width="w-16" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <SkeletonLoader width="w-16" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider lg:table-cell">
                  <SkeletonLoader width="w-20" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider lg:table-cell">
                  <SkeletonLoader width="w-20" height="h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <SkeletonLoader width="w-20" height="h-4" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    <SkeletonLoader width="w-16" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                    <SkeletonLoader width="w-28" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground hidden md:table-cell">
                    <SkeletonLoader width="w-24" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground hidden md:table-cell">
                    <SkeletonLoader width="w-16" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground hidden md:table-cell">
                    <SkeletonLoader width="w-16" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <SkeletonLoader width="w-20" height="h-5" className="rounded-full" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground lg:table-cell">
                    <SkeletonLoader width="w-24" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground lg:table-cell">
                    <SkeletonLoader width="w-24" height="h-5" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <SkeletonLoader width="w-24" height="h-5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OfficerBottomNav */}
      <SkeletonLoader width="w-full" height="h-16" className="fixed bottom-0 left-0" />
    </div>
  );
}

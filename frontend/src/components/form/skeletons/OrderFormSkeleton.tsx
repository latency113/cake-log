import React from "react";
import SkeletonLoader from "../../common/SkeletonLoader";

const OrderFormSkeleton: React.FC = () => {
  return (
    <div className="container max-w-11/12 mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center border-b border-gray-100">
        <SkeletonLoader width="w-1/3" height="h-8" className="mx-auto mb-2" />
      </div>

      {/* Form Content Container Skeleton */}
      <div className="relative overflow-hidden">
        <div className="flex gap-4">
          {/* General Info Section Skeleton */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 w-2/4">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-border">
              <SkeletonLoader width="w-8" height="h-8" className="rounded-xl" />
              <SkeletonLoader width="w-1/3" height="h-6" />
            </div>

            <div className="space-y-6">
              {/* Row 1: Competition Type, Book Number, Order Number */}
              <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <SkeletonLoader height="h-10" /> {/* RadioGroup */}
                </div>
                <div className="flex space-x-4">
                  <SkeletonLoader width="w-28" height="h-10" /> {/* Book Number */} 
                  <SkeletonLoader width="w-28" height="h-10" /> {/* Order Number */}
                </div>
              </div>

              {/* Row 2: Customer Name, Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonLoader height="h-10" />
                <SkeletonLoader height="h-10" />
              </div>

              {/* Row 3: Department, Year, Classroom, Team */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <SkeletonLoader key={i} height="h-10" />
                ))}
              </div>

              {/* Row 4: Advisor, Pickup Date, Pickup Time Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonLoader height="h-10" />
                <SkeletonLoader height="h-10" />
                <SkeletonLoader height="h-10" />
              </div>
            </div>
          </div>

          {/* Cake Details Table Skeleton */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex-1">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <SkeletonLoader width="w-8" height="h-8" className="rounded-xl" />
                <SkeletonLoader width="w-1/3" height="h-6" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <SkeletonLoader height="h-12" className="bg-muted mb-2" />
                {/* Table Rows */}
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} height="h-16" className="mb-1" />
                ))}
                {/* Total Row */}
                <SkeletonLoader height="h-20" className="bg-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section Skeleton */}
        <div className="p-6 bg-card rounded-xl border border-gray-200 shadow-sm mt-4">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-border">
            <SkeletonLoader width="w-8" height="h-8" className="rounded-xl" />
            <SkeletonLoader width="w-1/4" height="h-6" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <SkeletonLoader height="h-48" /> {/* Placeholder for PaymentCalculationCard */}
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex justify-end space-x-4 mt-2">
          <SkeletonLoader width="w-24" height="h-10" />
          <SkeletonLoader width="w-24" height="h-10" />
        </div>
      </div>
    </div>
  );
};

export default OrderFormSkeleton;

// src/app/(admin)/admin/components/SearchFilterSkeleton.js
"use client";

export default function SearchFilterSkeleton({ showExpandedFilters = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4 animate-pulse">
        {/* Search Bar Skeleton */}
        <div className="flex-1">
          <div className="relative">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Filter Controls Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Expanded Filters Skeleton */}
      {showExpandedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

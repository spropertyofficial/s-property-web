// src/app/(admin)/admin/components/ListSkeleton.js
"use client";

export default function ListSkeleton({ viewMode = "table", itemsPerPage = 10 }) {
  const skeletonItems = Array.from({ length: Math.min(itemsPerPage, 8) }, (_, i) => i);

  if (viewMode === "grid") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Results Info Skeleton */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Grid View Skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonItems.map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-200"></div>
                
                <div className="p-4 space-y-3">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  
                  {/* Developer */}
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  
                  {/* Location */}
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  
                  {/* Price */}
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Table View Skeleton
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Results Info Skeleton */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              {['Properti', 'Developer', 'Harga', 'Lokasi', 'Status', 'Dibuat', 'Aksi'].map((header, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skeletonItems.map((i) => (
              <tr key={i} className="animate-pulse">
                {/* Checkbox */}
                <td className="px-6 py-4">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </td>
                
                {/* Property Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </td>
                
                {/* Developer */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                
                {/* Price */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                
                {/* Location */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                
                {/* Status */}
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>
                
                {/* Created Date */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

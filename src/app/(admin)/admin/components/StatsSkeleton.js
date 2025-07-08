// src/app/(admin)/admin/components/StatsSkeleton.js
"use client";

export default function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              {/* Title */}
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              
              {/* Value */}
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              
              {/* Description */}
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Icon placeholder */}
            <div className="bg-gray-100 p-3 rounded-lg ml-4">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

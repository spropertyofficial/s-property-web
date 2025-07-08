// src/app/(admin)/admin/components/PageHeaderSkeleton.js
"use client";

export default function PageHeaderSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-pulse">
        <div className="space-y-2">
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          
          {/* Description */}
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Button */}
          <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
          
          {/* Export Button */}
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          
          {/* Add Button */}
          <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

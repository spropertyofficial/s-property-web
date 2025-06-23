// src/app/(site)/properties/residentials/loading.js

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Loading Skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse"></div>
      </div>

      {/* Search/Filter Bar Skeleton (if you have one) */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="h-10 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
      </div>

      {/* Property Cards Grid Loading */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Generate 9 loading cards */}
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            {/* Image Skeleton */}
            <div className="h-48 bg-gray-200"></div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>

              {/* Location */}
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>

              {/* Price */}
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>

              {/* Features */}
              <div className="flex space-x-4 pt-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>

              {/* Button */}
              <div className="pt-3">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-12 flex justify-center">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-10 w-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

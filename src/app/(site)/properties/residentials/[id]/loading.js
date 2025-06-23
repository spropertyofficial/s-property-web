// src/app/(site)/properties/residentials/[id]/loading.jsx

export default function PropertyDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Skeleton untuk Gallery */}
      <div className="bg-gray-200 h-64 md:h-96 rounded-lg animate-pulse mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Skeleton untuk Header */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Skeleton untuk Deskripsi */}
          <div className="mt-8 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>

        <div className="md:col-span-1">
          {/* Skeleton untuk Card Harga/Kontak */}
          <div className="bg-gray-200 h-48 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { getPropertiesData } from "@/app/api/properties/route";
import PropertiesClient from "@/components/sections/Properties/PropertiesClient";

// Loading component for properties
function PropertiesLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search loading */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="h-12 md:h-14 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Filter loading */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-8 md:h-10 w-20 md:w-28 bg-gray-200 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Advanced filter loading */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
      </div>

      {/* Grid loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse group hover:shadow-lg transition-all duration-300"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
            <div className="p-4 md:p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Properties component
async function Properties({ searchParams }) {
  const { assetType: filterType, search } = (await searchParams) || {};

  try {
    // Fetch all properties (already serialized from the API function)
    const allProperties = await getPropertiesData();

    // Get unique asset types for filter
    const assetTypes = [
      ...new Set(allProperties.map((p) => p.assetType?.name).filter(Boolean)),
    ].map((name) => ({ _id: name, name }));

    // Get unique market statuses for filter
    const marketStatuses = [
      ...new Set(allProperties.map((p) => p.marketStatus?.name).filter(Boolean)),
    ].map((name) => ({ _id: name, name }));

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Interactive Properties Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Suspense fallback={<PropertiesLoading />}>
              <PropertiesClient
                properties={allProperties}
                assetTypes={assetTypes}
                marketStatuses={marketStatuses}
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching properties:", error);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Terjadi Kesalahan
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Tidak dapat memuat data properti. Periksa koneksi internet Anda
              dan coba lagi.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-tosca-500 text-white px-8 py-3 rounded-xl hover:bg-tosca-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Properties;

import { Suspense } from "react";
import { getPropertiesData } from "@/app/api/properties/route";
import PropertiesClient from "@/components/sections/Properties/PropertiesClient";

// Loading component for properties
function PropertiesLoading() {
  return (
    <div className="space-y-6">
      {/* Search loading */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Filter loading */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Grid loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Semua Properti
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Temukan properti impian Anda dari koleksi lengkap kami
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-xl md:text-2xl font-bold text-tosca-500">
                {allProperties.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Total Properti
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-xl md:text-2xl font-bold text-blue-500">
                {assetTypes.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Tipe Properti
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:col-span-2 md:col-span-1">
              <div className="text-xl md:text-2xl font-bold text-green-500">
                {
                  allProperties.filter(
                    (p) => p.listingStatus?.name === "Dijual"
                  ).length
                }
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Tersedia Dijual
              </div>
            </div>
          </div>

          {/* Interactive Properties Section */}
          <Suspense fallback={<PropertiesLoading />}>
            <PropertiesClient
              allProperties={allProperties}
              assetTypes={assetTypes}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching properties:", error);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Terjadi Kesalahan
            </h1>
            <p className="text-gray-600 mb-4">
              Tidak dapat memuat data properti. Silakan coba lagi nanti.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-tosca-500 text-white px-6 py-2 rounded-lg hover:bg-tosca-600 transition-colors"
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

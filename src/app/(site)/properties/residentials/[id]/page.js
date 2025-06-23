// src/app/(site)/properties/residentials/[id]/page.js
import { getResidentialById } from "@/services/propertyService";
import { notFound } from "next/navigation";
import AddressInfo from "@/components/sections/Property/AddressInfo";
import Gallery from "@/components/sections/Property/Gallery";
import Header from "@/components/sections/Property/Header";
import WhatsAppButton from "@/components/common/WhatsappButton";

export default async function ResidentialDetailPage({ params }) {
  const { id } = await params;

  // Use centralized service to fetch property data
  const property = await getResidentialById(id);

  // If property with this ID is not found in combined data,
  // show 404 page
  if (!property) {
    notFound();
  }
  const plainProperty = JSON.parse(JSON.stringify(property));

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/* Gallery Section */}
        {plainProperty.gallery && plainProperty.gallery.length > 0 && (
          <Gallery images={plainProperty.gallery} />
        )}

        {/* Property Header */}
        <Header
          title={property.name}
          {...property}
          price={property.startPrice}
          type="Residential"
        />

        {/* Address Information */}
        {property.location && <AddressInfo {...property.location} />}

        {/* Additional Property Details */}
        <div className="mt-8 space-y-6">
          {/* Property Description */}
          {property.description && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Deskripsi Properti
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </section>
          )}

          {/* Property Specifications */}
          {(property.landSize ||
            property.buildingSize ||
            property.bedrooms ||
            property.bathrooms) && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Spesifikasi
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.landSize && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Luas Tanah</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {property.landSize} m²
                    </p>
                  </div>
                )}
                {property.buildingSize && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Luas Bangunan</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {property.buildingSize} m²
                    </p>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Kamar Tidur</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {property.bedrooms}
                    </p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Kamar Mandi</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {property.bathrooms}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Facilities */}
          {property.facilities && property.facilities.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Fasilitas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-tosca-200 rounded-full"></div>
                    <span className="text-gray-600">{facility}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton propertyData={plainProperty} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getResidentialById(id);

  if (!property) {
    return {
      title: "Properti Tidak Ditemukan",
      description: "Properti yang Anda cari tidak dapat ditemukan.",
    };
  }

  // Lakukan juga serialisasi di sini untuk keamanan
  const plainProperty = JSON.parse(JSON.stringify(property));

  return {
    title: `${plainProperty.name} - S-Property`,
    description: `${plainProperty.name} di ${plainProperty.location?.area}, ${
      plainProperty.location?.city
    }. Mulai dari ${
      plainProperty.startPrice
        ? `Rp ${plainProperty.startPrice.toLocaleString("id-ID")}`
        : "Hubungi kami untuk harga"
    }.`,
    openGraph: {
      title: `${plainProperty.name} - S-Property`,
      description: `${plainProperty.name} di ${plainProperty.location?.area}, ${plainProperty.location?.city}`,
      images:
        plainProperty.gallery && plainProperty.gallery.length > 0
          ? [plainProperty.gallery[0].src] // Pastikan gallery[0] memiliki .src
          : [],
    },
  };
}

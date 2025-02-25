import { MapPin, Bed, Bath, Home } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { formatToShortRupiah } from "@/utils/formatCurrency";

export default function PropertyCard({
  type = "unit", // "unit", "cluster", "housing"
  data,
}) {
  // Render berdasarkan tipe properti
  const renderContent = () => {
    switch (type) {
      case "units":
        return renderUnitContent(data);
      case "clusters":
        return renderClusterContent(data);
      case "residentials":
        return renderHousingContent(data);
      default:
        return null;
    }
  };

  // Render untuk unit rumah
  const renderUnitContent = ({
    title,
    location,
    price,
    specs,
    status,
    imageUrl,
    exclusive,
    postedDate,
  }) => (
    <>
      <div className="relative h-48">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <div className="absolute w-full h-full flex items-center justify-center">
          <Image
            src="/images/Watermark-SPRO.webp"
            alt="Watermark"
            width={200}
            height={20}
            sizes="100vw"
            className="object-contain w-auto h-64"
          />
        </div>
        <div className="absolute top-3 left-3 bg-gray-800/80 text-white px-2 py-1 rounded text-sm">
          {status}
        </div>
        {exclusive && (
          <div className="absolute top-3 right-3 bg-[#F5A624]/90 text-white px-2 py-1 rounded text-sm">
            Eksklusif
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-tosca-200 text-white font-bold text-lg px-3 rounded-md">
          Rp {price}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-8">
            <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin size={14} className="mr-1" />
              <span>{location}</span>
            </div>
            <div className="flex gap-3 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <Bed size={14} className="mr-1" />
                <span>{specs.beds} KT</span>
              </div>
              <div className="flex items-center">
                <Bath size={14} className="mr-1" />
                <span>{specs.baths} KM</span>
              </div>
              <div className="flex items-center">
                <Home size={14} className="mr-1" />
                <span>{specs.size}m²</span>
              </div>
            </div>
            <div className="text-[8px] text-gray-400">
              Tayang sejak {postedDate}
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex justify-end items-center gap-4">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white p-1.5 rounded-lg transition-colors"
              >
                <FaWhatsapp size={30} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Render untuk cluster
  const renderClusterContent = ({
    name,
    location,
    priceStart,
    thumbnail,
    unitTypes,
  }) => (
    <>
      <div className="relative h-48">
        <Image src={thumbnail} alt={name} fill className="object-cover" />
        <div className="absolute bottom-3 left-3 bg-tosca-200 text-white px-3 py-1 rounded-md">
          Start from Rp {priceStart}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-2">{name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{location}</span>
        </div>
        <div className="text-sm text-gray-500">{unitTypes.join(" • ")}</div>
      </div>
    </>
  );

  // Render untuk perumahan
  const renderHousingContent = ({
    name,
    location,
    gallery,
    id,
    startPrice,
  }) => (
    <>
      <div className="relative h-48">
        <Image src={gallery[0].src} alt={name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-2">{name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin size={14} className="mr-1" />
          <span>
            {location.region}, {location.city}, {location.area}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Start from {""}
          <span className="font-semibold text-lg text-tosca-500">
            {formatToShortRupiah(startPrice)}
          </span>
        </div>
      </div>
      <div className="mt-4 px-4 pb-4">
        <Link
          href={`/properties/${type}/${id}`}
          className="block w-full text-center bg-tosca-500 text-white py-2 px-4 rounded-md hover:bg-tosca-600 transition-colors"
        >
          View Details
        </Link>
      </div>
    </>
  );
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {renderContent()}
    </div>
  );
}

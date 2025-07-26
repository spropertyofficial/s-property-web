import { MapPin, Bed, Bath, Home } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { formatToShortRupiah } from "@/utils/formatCurrency";
import Watermark from "@/components/sections/Property/Gallery/components/Watermark";

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
        return renderResidentialContent(data);
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
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-cover"
        />
        <Watermark />
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
        <Watermark />
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
  const renderResidentialContent = ({
    name,
    location,
    gallery,
    _id,
    startPrice,
    assetType,
    listingStatus,
  }) => (
    <>
      <div className="group flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
        <div className="relative h-40 overflow-hidden">
          <Image
            src={gallery?.[0]?.src || '/images/placeholder-property.jpg'}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <Watermark />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Quick action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <button className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col flex-grow p-3">
          {/* Status badges - kompak dalam satu baris */}
          <div className="flex gap-1.5 mb-2">
            {assetType?.name && (
              <div className="bg-tosca-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                {assetType.name}
              </div>
            )}
            {listingStatus?.name && (
              <div className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">
                {listingStatus.name}
              </div>
            )}
          </div>

          {/* Title - lebih compact */}
          <h3 className="font-semibold text-gray-900 mb-1.5 text-sm leading-tight line-clamp-2 group-hover:text-tosca-600 transition-colors duration-300">
            {name}
          </h3>
          
          {/* Location - lebih compact */}
          <div className="flex items-start text-gray-600 text-xs mb-2">
            <MapPin size={12} className="text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed line-clamp-2">
              {location?.area && `${location.area}, `}
              {location?.city && `${location.city}, `}
              {location?.region}
            </span>
          </div>
          
          {/* Price section - lebih prominent */}
          <div className="mt-auto">
            <div className="text-xs text-gray-500 mb-1">Mulai dari</div>
            <div className="text-lg font-bold text-tosca-600 group-hover:scale-105 group-hover:text-black group-hover:font-black group-hover:translate-x-1 transition-all duration-300 origin-left mb-2">
              {formatToShortRupiah(startPrice)}
            </div>
            
            <Link
              href={`/properties/${type}/${_id}`}
              className="block w-full text-center bg-tosca-500 text-white py-1.5 px-3 rounded-lg hover:bg-tosca-600 transition-all duration-300 transform hover:scale-[1.02] font-medium text-sm shadow-lg hover:shadow-xl"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    </>
  );
  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
}

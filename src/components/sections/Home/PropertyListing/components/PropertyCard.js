import { MapPin, Bed, Bath, Home } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

export default function PropertyCard({
  title,
  location,
  price,
  specs,
  status,
  imageUrl,
  exclusive,
  postedDate,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-48">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        {/* Watermark overlay */}
        <div className="absolute w-full h-full flex items-center justify-center">
          <Image
            src="/images/Watermark-SPRO.webp"
            alt="Watermark"
            width={200}
            height={30}
            className="object-contain"
          />
        </div>
        <div className="absolute top-3 left-3 bg-tosca-200 text-white px-2 py-1 rounded text-sm">
          {status}
        </div>
        {exclusive && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded text-sm">
            Eksklusif
          </div>
        )}
      </div>

      <div className="p-4">
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

        <div className="flex justify-between items-center">
          <div>
            <div className="bg-tosca-200 text-white font-bold text-lg px-3 rounded-md mb-1 shadow-md hover:bg-tosca-600 transition-colors">
              Rp {price}
            </div>
            <div className="text-[8px] text-gray-400">
              Tayang sejak {postedDate}
            </div>
          </div>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white p-1.5 rounded-lg transition-colors"
          >
            <FaWhatsapp size={30} />
          </a>
        </div>
        {/* Status - Menggunakan warna yang lebih gelap dengan opacity */}
        <div className="absolute top-3 left-3 bg-gray-800/80 text-white px-2 py-1 rounded text-sm">
          {status}
        </div>
        {/* Eksklusif - Mempertahankan orange tapi dengan opacity */}
        {exclusive && (
          <div className="absolute top-3 right-3 bg-[#F5A624]/90 text-white px-2 py-1 rounded text-sm">
            Eksklusif
          </div>
        )}
        {/* Harga - Menggunakan warna yang sama dengan status untuk konsistensi */}
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
    </div>
  );
}

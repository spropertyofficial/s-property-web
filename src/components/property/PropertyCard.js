import { MapPin, Bed, Bath, Home } from 'lucide-react'
import Image from 'next/image'

export default function PropertyCard({ title, location, price, specs, status }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-48">
        <Image
          src="/images/property-sample.jpg"
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 bg-tosca-200 text-white px-2 py-1 rounded text-sm">
          {status}
        </div>
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

        <div className="text-tosca-200 font-semibold">
          Rp {price}
        </div>
      </div>
    </div>
  )
}
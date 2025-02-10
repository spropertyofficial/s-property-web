export default function PropertyCard({ title, location, specs, price, imageUrl, status, isExclusive }) {
  return (
    <div className="relative rounded-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      {/* Background Image */}
      <div className="h-48 relative">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Status Labels */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm">
          {status}
        </span>
        {isExclusive && (
          <span className="bg-orange-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm">
            Eksklusif
          </span>
        )}
      </div>

      {/* Price */}
      <div className="absolute bottom-3 left-3">
        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-sm font-medium">
          Rp {price}
        </span>
      </div>

      {/* Property Info - Floating Card */}
      <div className="absolute -bottom-20 group-hover:-bottom-0 left-0 right-0 bg-white p-4 transition-all duration-300">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{location}</p>
        
        <div className="flex gap-4 mt-2 text-gray-500 text-sm">
          <span>{specs.bedrooms} KT</span>
          <span>{specs.bathrooms} KM</span>
          <span>{specs.area}m²</span>
        </div>
      </div>
    </div>
  )
}
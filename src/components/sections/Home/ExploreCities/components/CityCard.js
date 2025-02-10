import Image from 'next/image'


export default function CityCard({ name, propertyCount, imageUrl }) {
  return (
    <div className="relative rounded-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      {/* Background Image */}
      <div className="h-48 relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Content */}
      <div className="absolute top-3 left-3 text-white">
        {propertyCount > 0 && (
          <span className="text-sm mb-1 block">{propertyCount} Property</span>
        )}
        <h3 className="text-lg font-medium">{name}</h3>
      </div>

      {/* More Details Button */}
      <div className="absolute bottom-3 left-3 flex items-center">
        <button className="text-white text-sm hover:underline">
          MORE DETAILS
        </button>
      </div>
    </div>
  )
}
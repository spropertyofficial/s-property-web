import Link from 'next/link';

export default function SearchResults({ results }) {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg max-h-96 overflow-y-auto z-50">
      {results.map((property) => (
        <Link 
          key={property.id}
          href={`/properties/residentials/${property.id}`}
        >
          <div className="p-4 hover:bg-gray-50 cursor-pointer border-b">
            <h3 className="font-medium">{property.name}</h3>
            <p className="text-sm text-gray-600">
              {property.location.area}, {property.location.city}
            </p>
            <p className="text-sm text-gray-500">
              Mulai dari {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(property.startPrice)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

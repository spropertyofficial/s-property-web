import PropertyCard from './PropertyCard'

export default function PropertyListing() {
  // Nanti data ini akan diambil dari API/database
  const newProperties = [
    {
      id: 1,
      title: "Rumah Modern Minimalis",
      location: "BSD City, Tangerang Selatan",
      price: "1.5 M",
      specs: { beds: 3, baths: 2, size: 120 },
      status: "Dijual"
    },
    {
      id: 2,
      title: "Cluster Premium Residence",
      location: "Gading Serpong, Tangerang",
      price: "2.1 M",
      specs: { beds: 4, baths: 3, size: 150 },
      status: "Dijual"
    },
  ]

  return (
    <div className="px-6 py-6 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Properti Terbaru</h2>
      <div className="grid gap-4">
        {newProperties.map((property) => (
          <PropertyCard 
            key={property.id}
            {...property}
          />
        ))}
      </div>
    </div>
  )
}
export default function PropertyListing() {
  // Nanti data ini akan diambil dari API/database
  const newProperties = [
    {
      id: 1,
      imageUrl:
        "https://images.pexels.com/photos/2104742/pexels-photo-2104742.jpeg",
      title: "Rumah Modern Minimalis",
      location: "BSD City, Tangerang Selatan",
      price: "1.5 M",
      specs: { beds: 3, baths: 2, size: 120 },
      status: "Dijual",
      exclusive: true,
      postedDate: "20 Jan 2024",
    },
    {
      id: 2,
      imageUrl:
        "https://images.pexels.com/photos/4509133/pexels-photo-4509133.jpeg",
      title: "Cluster Premium Residence",
      location: "Gading Serpong, Tangerang",
      price: "2.1 M",
      specs: { beds: 4, baths: 3, size: 150 },
      status: "Dijual",
      postedDate: "21 Jan 2024",
    },
    {
      id: 3,
      imageUrl:
        "https://images.pexels.com/photos/4509133/pexels-photo-4509133.jpeg",
      title: "Cluster Premium Residence",
      location: "Gading Serpong, Tangerang",
      price: "2.1 M",
      specs: { beds: 4, baths: 3, size: 150 },
      status: "Dijual",
      exclusive: true,
      postedDate: "22 Jan 2024",
    },
  ];
  return (
    <div className="px-6 py-6 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Properti Terbaru
      </h2>
      <div className="grid gap-4">
        {newProperties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  );
}

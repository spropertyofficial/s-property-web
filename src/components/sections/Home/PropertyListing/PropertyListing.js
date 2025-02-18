import PropertyCard from "./components/PropertyCard";
import { residentials } from "@/data/residentials";

export default function PropertyListing() {
  return (
    <div className="px-6 py-6 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Properti Terbaru
      </h2>
      <div className="grid gap-4">
        {properties.map((property) => (
          <PropertyCard 
            key={property.id} 
            name={property.name}
            location={property.location}
            clusters={property.clusters}
            gallery={property.gallery}
          />
        ))}
      </div>
    </div>
  );
}

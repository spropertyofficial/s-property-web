  import { residentialsData } from "@/data/residentials";
  import PropertyCard from "@/components/common/PropertyCard/PropertyCard";

  export default async function ResidentialsPage({ searchParams }) {
    const { city } = await searchParams;
  
    const filteredResidentials = city 
      ? residentialsData.filter(residential => 
          residential.location.city === city || 
          residential.location.area === city
        )
      : residentialsData;

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {city ? `Properti di ${city}` : 'Semua Properti'}
        </h1>
      
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResidentials.map(residential => (
            <PropertyCard 
              key={residential.id}
              type="residentials"
              data={residential}
            />
          ))}
        </div>
      </div>
    );
  }
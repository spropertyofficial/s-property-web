import { residentialsData } from "@/data/residentials";
import PropertyCard from "@/components/common/PropertyCard/PropertyCard";
import { getResidentialsData } from "@/app/api/residential/route";

export default async function ResidentialsPage({ searchParams }) {
  const { city } = searchParams;

  let dynamicResidentials = [];
  try {
    dynamicResidentials = await getResidentialsData();
  } catch (error) {
    console.error("Gagal mengambil data langsung dari server:", error);
  }
  const combinedDataMap = new Map();

  residentialsData.forEach((item) => {
    combinedDataMap.set(item.id, item);
  });

  dynamicResidentials.forEach((item) => {
    const normalizedId = item._id ? item._id.toString() : item.id;
    combinedDataMap.set(normalizedId, { ...item, id: normalizedId });
  });

  const allResidentials = Array.from(combinedDataMap.values());

  const filteredResidentials = city
    ? allResidentials.filter(
        (residential) =>
          (residential.location?.city || "")
            .toLowerCase()
            .includes(city.toLowerCase()) ||
          (residential.location?.area || "")
            .toLowerCase()
            .includes(city.toLowerCase())
      )
    : allResidentials;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {city ? `Properti di ${city}` : "Semua Properti"}
      </h1>

      {filteredResidentials.length === 0 ? (
        <p className="text-center text-gray-500">
          Tidak ada properti yang ditemukan {city ? `di area ${city}` : ""}.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResidentials.map((residential) => (
            <PropertyCard
              key={residential.id}
              type="residentials"
              data={residential}
            />
          ))}
        </div>
      )}
    </div>
  );
}
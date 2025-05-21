import Image from "next/image";
import Link from "next/link";
import { residentialsData } from "@/data/residentials";

export default function ExploreCities() {
  const cityCounts = {};

  // Daftar kota yang ingin kita pantau
  const citiesToTrack = [
    ...new Set(
      residentialsData
        .map((property) => property.location.city)
        .filter((city) => city)
    ),
  ];

  // Inisialisasi counter untuk setiap kota
  citiesToTrack.forEach((city) => {
    cityCounts[city] = 0;
  });

  // Hitung properti yang mengandung nama kota
  residentialsData.forEach((property) => {
    const locationCity = property.location.city;

    if (locationCity) {
      citiesToTrack.forEach((city) => {
        // Jika lokasi properti mengandung nama kota (case insensitive)
        if (locationCity.toLowerCase().includes(city.toLowerCase())) {
          cityCounts[city] += 1;
        }
      });
    }
  });

  const cities = citiesToTrack
    .map((cityName) => {
      // Buat objek kota dengan data yang diperlukan
      return {
        name: cityName,
        // Gunakan gambar placeholder jika tidak ada gambar spesifik
        imageUrl: `/images/Cities/${cityName
          .toLowerCase()
          .replace(/\s+/g, "-")}.webp`,
        propertyCount: cityCounts[cityName] || 0,
      };
    })
    .filter((city) => city.propertyCount > 0); // Hanya tampilkan kota dengan properti

  return (
    <div className="px-6 py-8 bg-white">
      {/* Title Section */}
      <div className="text-center mb-8">
        <span className="text-sm text-tosca-200 uppercase tracking-wider">
          JELAJAHI KOTA IMPIAN
        </span>
        <h2 className="text-2xl font-semibold mt-2">
          Temukan Hunian Idaman di Kota Favoritmu
        </h2>
        <p className="text-gray-500 mt-2 text-sm px-4">
          Kami hadirkan berbagai pilihan properti terbaik di lokasi strategis.
          Dapatkan panduan lengkap dari tim ahli kami untuk menemukan properti
          yang sesuai dengan kebutuhan Anda.
        </p>
      </div>

      {/* Updated Grid Section with Links */}
      <div className="grid grid-cols-auto-fit gap-4">
        {cities.map(
          (city, index) =>
            city.propertyCount > 0 && (
              <Link
                href={`/properties/residentials?city=${encodeURIComponent(
                  city.name
                )}`}
                key={index}
              >
                <div className="group cursor-pointer">
                  <div className="relative h-[160px] md:h-[200px] rounded-lg overflow-hidden bg-gradient-to-r from-tosca-200 to-tosca-100">
                    <Image
                      src={city.imageUrl}
                      alt={city.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300 w-auto h-auto"
                    />

                    {/* Content */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-base md:text-lg font-medium mb-1">
                        {city.name}
                      </h3>
                      <p className="text-xs md:text-sm opacity-90">
                        {city.propertyCount}
                        {city.propertyCount === 1 ? " Property" : " Properties"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
}

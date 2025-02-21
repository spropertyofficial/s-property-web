import Image from "next/image";
import Link from "next/link";

export default function ExploreCities() {
  const cities = [
    {
      name: "Jakarta Barat",
      propertyCount: 1,
      imageUrl:
        "https://images.pexels.com/photos/2437286/pexels-photo-2437286.jpeg",
    },
    {
      name: "Jakarta Selatan",
      propertyCount: 0,
      imageUrl:
        "https://images.pexels.com/photos/4513940/pexels-photo-4513940.jpeg",
    },
    {
      name: "Jakarta Timur",
      propertyCount: 0,
      imageUrl:
        "https://images.pexels.com/photos/2893670/pexels-photo-2893670.jpeg",
    },
    {
      name: "Jakarta Pusat",
      propertyCount: 0,
      imageUrl:
        "https://images.pexels.com/photos/4509131/pexels-photo-4509131.jpeg",
    },
    {
      name: "Jakarta Utara",
      propertyCount: 0,
      imageUrl:
        "https://images.pexels.com/photos/4509072/pexels-photo-4509072.jpeg",
    },
    {
      name: "Kab. Bogor",
      propertyCount: 3,
      imageUrl:
        "https://images.pexels.com/photos/2104742/pexels-photo-2104742.jpeg",
    },
    {
      name: "Kab. Tangerang",
      propertyCount: 3,
      imageUrl:
        "https://images.pexels.com/photos/2104742/pexels-photo-2104742.jpeg",
    },
    {
      name: "BSD City",
      propertyCount: 3,
      imageUrl:
        "https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg",
    },
    {
      name: "Sidoarjo",
      propertyCount: 1,
      imageUrl:
        "https://images.pexels.com/photos/4509061/pexels-photo-4509061.jpeg",
    },
    {
      name: "Tangerang Selatan",
      propertyCount: 1,
      imageUrl:
        "https://images.pexels.com/photos/4509133/pexels-photo-4509133.jpeg",
    },
  ];

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cities.map((city, index) => (
          <Link
            href={`/properties/residentials?city=${encodeURIComponent(
              city.name
            )}`}
            key={index}
          >
            <div className="group cursor-pointer">
              <div className="relative h-[160px] md:h-[200px] rounded-lg overflow-hidden">
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
                    {city.propertyCount}{" "}
                    {city.propertyCount === 1 ? "Property" : "Properties"}
                  </p>
                </div>

                {/* More Details Button */}
                <div className="absolute bottom-4 right-4 hidden md:block">
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:underline">
                    MORE DETAILS
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

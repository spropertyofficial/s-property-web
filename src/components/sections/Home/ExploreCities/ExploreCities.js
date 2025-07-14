"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

// Function to fetch hierarchical data from API
async function fetchExploreCitiesData() {
  try {
    const res = await fetch("/api/explore-cities");
    if (!res.ok) return {};
    const data = await res.json();
    return data.success ? data.data : {};
  } catch (error) {
    console.error("Failed to fetch explore cities data", error);
    return {};
  }
}

export default function ExploreCities() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hierarchicalData, setHierarchicalData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and process data when component mounts
  useEffect(() => {
    const processData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchExploreCitiesData();
        setHierarchicalData(data);
      } catch (error) {
        console.error("Error processing explore cities data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, []);

  const regionsList = Object.values(hierarchicalData).filter(
    (r) => r.propertyCount > 0
  );

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  const handleBackClick = () => {
    setSelectedRegion(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Jelajahi Kota Impian
          </h2>
          <p className="text-gray-600 mb-8">Memuat data properti...</p>
          <div className="grid grid-cols-auto-fit gap-4">
            {/* Loading skeleton */}
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-[160px] md:h-[200px] rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <AnimatePresence mode="wait">
        {/* TAMPILAN 1: PROVINSI */}
        {!selectedRegion && (
          <motion.div
            key="regions-view"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              Jelajahi Kota Impian
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Pilih wilayah untuk menemukan properti idaman Anda.
            </p>

            {regionsList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Belum ada data properti tersedia.
                </p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-auto-fit gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {regionsList.map((region) => (
                  <motion.div
                    key={region.name}
                    variants={cardVariants}
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRegionClick(region)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-[160px] md:h-[200px] rounded-lg overflow-hidden bg-gradient-to-r from-tosca-200 to-tosca-100 shadow-md">
                      <Image
                        src={region.imageUrl}
                        alt={`Properti di ${region.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                        <div>
                          <h3 className="text-white font-bold text-lg md:text-xl">
                            {region.name}
                          </h3>
                          <p className="text-white text-sm">
                            {region.propertyCount} Properti
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TAMPILAN 2: KOTA */}
        {selectedRegion && (
          <motion.div
            key="cities-view"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 font-medium text-tosca-600 hover:text-tosca-800 mb-6 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              Properti di {selectedRegion.name}
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Tersedia di kota-kota berikut.
            </p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Object.values(selectedRegion.cities)
                .filter((c) => c.propertyCount > 0)
                .map((city) => (
                  <Link
                    href={`/properties/residentials?city=${encodeURIComponent(
                      city.name
                    )}`}
                    key={city.name}
                  >
                    <motion.div
                      variants={cardVariants}
                      whileHover={{
                        scale: 1.05,
                        y: -8,
                        boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                    >
                      <div className="relative h-[160px] md:h-[200px] rounded-lg overflow-hidden bg-gradient-to-r from-tosca-200 to-tosca-100 shadow-md">
                        <Image
                          src={city.imageUrl}
                          alt={`Properti di ${city.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                          <div>
                            <h3 className="text-white font-bold text-lg md:text-xl">
                              {city.name}
                            </h3>
                            <p className="text-white text-sm">
                              {city.propertyCount} Properti
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

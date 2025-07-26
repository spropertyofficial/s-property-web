"use client";

import { useState, useEffect, useMemo } from "react";
import PropertyCard from "@/components/common/PropertyCard/PropertyCard";

// Asset type options fetched from API
function useAssetTypeOptions() {
  const [options, setOptions] = useState([
    { value: "all", label: "Semua Properti" },
  ]);
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch("/api/categories/asset-types");
        const data = await res.json();
        if (Array.isArray(data.assetTypes)) {
          const apiOptions = data.assetTypes.map((s) => ({
            value: s.name,
            label: s.name,
          }));
          setOptions([
            { value: "all", label: "Semua Properti" },
            ...apiOptions,
          ]);
        }
      } catch {}
    }
    fetchOptions();
  }, []);
  return options;
}

// Market status options fetched from API
function useMarketStatusOptions() {
  const [options, setOptions] = useState([{ value: "all", label: "Semua" }]);
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch("/api/categories/listing-status");
        const data = await res.json();
        if (Array.isArray(data.listingStatus)) {
          const apiOptions = data.listingStatus.map((s) => ({
            value: s.name,
            label: s.name,
          }));
          setOptions([{ value: "all", label: "Semua" }, ...apiOptions]);
        }
      } catch {}
    }
    fetchOptions();
  }, []);
  return options;
}

// Classification options fetched from API market-status
function useClassificationOptions() {
  const [options, setOptions] = useState([{ value: "all", label: "Semua" }]);
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch("/api/categories/market-status");
        const data = await res.json();
        if (Array.isArray(data.marketStatus)) {
          const apiOptions = data.marketStatus.map((s) => ({
            value: s.name,
            label: s.name,
          }));
          setOptions([{ value: "all", label: "Semua" }, ...apiOptions]);
        }
      } catch {}
    }
    fetchOptions();
  }, []);
  return options;
}

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [assetType, setAssetType] = useState("all");
  const [city, setCity] = useState("all");
  const assetTypeOptions = useAssetTypeOptions();
  const marketStatusOptions = useMarketStatusOptions();
  const classificationOptions = useClassificationOptions();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minLand, setMinLand] = useState("");
  const [maxLand, setMaxLand] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [marketStatus, setMarketStatus] = useState("all");
  const [classification, setClassification] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        if (data) {
          setProperties(data.properties || []);
        } else {
          setError(data.message || "Gagal memuat data properti");
        }
      } catch (err) {
        setError("Gagal memuat data properti");
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // Get unique cities for filter
  const cityOptions = useMemo(() => {
    const cities = [
      ...new Set(properties.map((p) => p.location?.city).filter(Boolean)),
    ];
    return ["all", ...cities];
  }, [properties]);

  // Filtering logic
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(kw) ||
          p.location?.city?.toLowerCase().includes(kw) ||
          p.location?.region?.toLowerCase().includes(kw)
      );
    }
    if (assetType !== "all") {
      filtered = filtered.filter((p) => p.assetType?.name === assetType);
    }
    if (city !== "all") {
      filtered = filtered.filter((p) => p.location?.city === city);
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.startPrice >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.startPrice <= Number(maxPrice));
    }
    if (minLand) {
      filtered = filtered.filter((p) => p.landSize >= Number(minLand));
    }
    if (maxLand) {
      filtered = filtered.filter((p) => p.landSize <= Number(maxLand));
    }
    if (bedrooms) {
      if (bedrooms === "4+") filtered = filtered.filter((p) => p.bedrooms >= 4);
      else filtered = filtered.filter((p) => p.bedrooms === Number(bedrooms));
    }
    if (bathrooms) {
      if (bathrooms === "3+")
        filtered = filtered.filter((p) => p.bathrooms >= 3);
      else filtered = filtered.filter((p) => p.bathrooms === Number(bathrooms));
    }
    if (marketStatus !== "all") {
      filtered = filtered.filter((p) => p.listingStatus?.name === marketStatus);
    }
    if (classification !== "all") {
      filtered = filtered.filter((p) => p.classification === classification);
    }
    // Sorting
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.startPrice - b.startPrice);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.startPrice - a.startPrice);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return filtered;
  }, [
    properties,
    keyword,
    assetType,
    city,
    minPrice,
    maxPrice,
    minLand,
    maxLand,
    bedrooms,
    bathrooms,
    marketStatus,
    classification,
    sortBy,
  ]);

  // Active filters for pill display
  const activeFilters = useMemo(() => {
    const pills = [];
    if (assetType !== "all") pills.push({ key: "assetType", label: assetType });
    if (city !== "all") pills.push({ key: "city", label: `Kota: ${city}` });
    if (minPrice)
      pills.push({ key: "minPrice", label: `Min Harga: Rp${minPrice}` });
    if (maxPrice)
      pills.push({ key: "maxPrice", label: `Maks Harga: Rp${maxPrice}` });
    if (minLand)
      pills.push({ key: "minLand", label: `Min Luas: ${minLand}m²` });
    if (maxLand)
      pills.push({ key: "maxLand", label: `Maks Luas: ${maxLand}m²` });
    if (bedrooms) pills.push({ key: "bedrooms", label: `${bedrooms} KT` });
    if (bathrooms) pills.push({ key: "bathrooms", label: `${bathrooms} KM` });
    if (marketStatus !== "all")
      pills.push({ key: "marketStatus", label: `Pasar: ${marketStatus}` });
    if (classification !== "all")
      pills.push({ key: "classification", label: `Klasifikasi: ${classification}` });
    return pills;
  }, [
    assetType,
    city,
    minPrice,
    maxPrice,
    minLand,
    maxLand,
    bedrooms,
    bathrooms,
    marketStatus,
    classification,
  ]);

  // Reset all filters
  function resetFilters() {
    setKeyword("");
    setAssetType("all");
    setCity("all");
    setMinPrice("");
    setMaxPrice("");
    setMinLand("");
    setMaxLand("");
    setBedrooms("");
    setBathrooms("");
    setMarketStatus("all");
    setClassification("all");
    setSortBy("newest");
  }

  // Remove individual filter
  function removeFilter(key) {
    switch (key) {
      case "assetType":
        setAssetType("all");
        break;
      case "city":
        setCity("all");
        break;
      case "minPrice":
        setMinPrice("");
        break;
      case "maxPrice":
        setMaxPrice("");
        break;
      case "minLand":
        setMinLand("");
        break;
      case "maxLand":
        setMaxLand("");
        break;
      case "bedrooms":
        setBedrooms("");
        break;
      case "bathrooms":
        setBathrooms("");
        break;
      case "marketStatus":
        setMarketStatus("all");
        break;
      case "classification":
        setClassification("all");
        break;
      default:
        break;
    }
  }

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calculate paginated items
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    keyword,
    assetType,
    city,
    minPrice,
    maxPrice,
    minLand,
    maxLand,
    bedrooms,
    bathrooms,
    marketStatus,
    classification,
    sortBy,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold mb-2 text-red-700">
            Gagal memuat data properti
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 font-semibold"
        >
          <span className="mr-2">▼</span> Filter & Urutkan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
        {/* Filter Sidebar (Left Column) */}
        <aside
          className={`filter-sidebar fixed lg:sticky top-0 left-0 h-full lg:h-auto lg:top-8 bg-white lg:bg-transparent shadow-lg lg:shadow-none p-6 lg:p-0 z-50 lg:z-auto w-80 lg:w-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="flex justify-between items-center lg:hidden mb-6">
            <h2 className="text-xl font-bold">Filter Lanjutan</h2>
            <button className="text-2xl" onClick={() => setSidebarOpen(false)}>
              &times;
            </button>
          </div>
          <div className="space-y-6">
            {/* City Filter */}
            <div>
              <h3 className="font-semibold mb-2">Lokasi</h3>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {cityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "all" ? "Semua Kota" : opt}
                  </option>
                ))}
              </select>
            </div>
            {/* Price Filter */}
            <div>
              <h3 className="font-semibold mb-2">Rentang Harga</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Harga Minimum (Rp)"
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Harga Maksimum (Rp)"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            {/* Land Size Filter */}
            <div>
              <h3 className="font-semibold mb-2">Luas Tanah (m²)</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  value={minLand}
                  onChange={(e) => setMinLand(e.target.value)}
                  placeholder="Luas Minimum"
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="number"
                  value={maxLand}
                  onChange={(e) => setMaxLand(e.target.value)}
                  placeholder="Luas Maksimum"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            {/* Bedrooms Filter */}
            <div>
              <h3 className="font-semibold mb-2">Kamar Tidur</h3>
              <div className="flex flex-wrap gap-2">
                {["1", "2", "3", "4+"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBedrooms(bedrooms === val ? "" : val)}
                    className={`px-3 py-1 border rounded-full ${
                      bedrooms === val
                        ? "bg-teal-600 text-white border-teal-600"
                        : ""
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            {/* Bathrooms Filter */}
            <div>
              <h3 className="font-semibold mb-2">Kamar Mandi</h3>
              <div className="flex flex-wrap gap-2">
                {["1", "2", "3+"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBathrooms(bathrooms === val ? "" : val)}
                    className={`px-3 py-1 border rounded-full ${
                      bathrooms === val
                        ? "bg-teal-600 text-white border-teal-600"
                        : ""
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            {/* Market Status Filter */}
            <div>
              <h3 className="font-semibold mb-2">Status Pasar</h3>
              <select
                value={marketStatus}
                onChange={(e) => setMarketStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {marketStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Classification Filter */}
            <div>
              <h3 className="font-semibold mb-2">Klasifikasi</h3>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {classificationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-100"
            >
              Reset Filter
            </button>
          </div>
        </aside>

        {/* Main Content (Right Column) */}
        <main className="lg:col-span-3">
          {/* Search and Sort Bar */}
          <div className="bg-white p-4 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari properti, lokasi, developer..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-3 border rounded-lg"
              >
                <option value="newest">Terbaru</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Asset Type Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {assetTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAssetType(opt.value)}
                className={`filter-button px-4 py-2 border rounded-full font-semibold transition-colors duration-150
                  ${assetType === opt.value ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-300 hover:bg-teal-50"}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Active Filters & Results Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">
              Menampilkan {filteredProperties.length} dari {properties.length}{" "}
              properti
            </p>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center"
                >
                  <span>{f.label}</span>
                  <button
                    className="ml-1.5 text-teal-600 hover:text-teal-800"
                    onClick={() => removeFilter(f.key)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Property Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedProperties.length === 0 ? (
              <p className="col-span-full text-center text-slate-500 py-10">
                Tidak ada properti yang ditemukan.
              </p>
            ) : (
              paginatedProperties.map((p) => (
                <PropertyCard key={p._id} type="residentials" data={p} />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-white text-slate-700 disabled:opacity-50"
              >
                &laquo; Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1
                      ? "bg-teal-600 text-white"
                      : "bg-white text-slate-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-white text-slate-700 disabled:opacity-50"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PropertiesPage;

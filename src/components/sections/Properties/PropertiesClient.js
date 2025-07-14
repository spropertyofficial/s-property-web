"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import PropertyCard from "@/components/common/PropertyCard/PropertyCard";

// Combined Search and Filters component
function SearchAndFilters({
  searchQuery,
  onSearch,
  availableRegions,
  availableCities,
  assetTypes,
  currentFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  showAdvanced,
  onToggleAdvanced,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate location suggestions based on input
  const locationSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const regions = availableRegions
      .filter((region) => region.toLowerCase().includes(query))
      .map((region) => ({ type: "region", value: region }));

    const cities = availableCities
      .filter((city) => city.toLowerCase().includes(query))
      .map((city) => ({ type: "city", value: city }));

    return [...regions, ...cities].slice(0, 8);
  }, [searchQuery, availableRegions, availableCities]);

  const handleSuggestionClick = (suggestion) => {
    onSearch(suggestion.value);
    setShowSuggestions(false);
  };

  // Expanded property categories
  const expandedCategories = [
    { name: "Semua Properti", value: "" },
    { name: "Perumahan", value: "Perumahan" },
    { name: "Apartemen", value: "Apartemen" },
    { name: "Tanah", value: "Tanah" },
    { name: "Ruko", value: "Ruko" },
    { name: "Komersial", value: "Komersial" },
    ...assetTypes
      .filter(
        (type) =>
          !["Perumahan", "Apartemen", "Tanah", "Ruko", "Komersial"].includes(
            type.name || type
          )
      )
      .map((type) => ({ 
        name: typeof type === 'object' ? type.name : type, 
        value: typeof type === 'object' ? type.name : type 
      })),
  ];

  const sortOptions = [
    { value: "newest", label: "🕐 Terbaru" },
    { value: "oldest", label: "📅 Terlama" },
    { value: "price_low", label: "💰 Harga Terendah" },
    { value: "price_high", label: "💎 Harga Tertinggi" },
    { value: "name_asc", label: "🔤 Nama A-Z" },
    { value: "name_desc", label: "🔡 Nama Z-A" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-in slide-in-from-top-2">
      {/* Main Search and Filter Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Search - takes more space */}
        <div className="lg:col-span-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            🔍 Pencarian
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-tosca-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari properti, lokasi, developer..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-11 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300 bg-white placeholder-gray-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}

            {/* Location suggestions dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">
                    Saran Lokasi:
                  </div>
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-sm">{suggestion.value}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {suggestion.type === "region" ? "Wilayah" : "Kota"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            🏢 Kategori
          </label>
          <select
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300 bg-white text-gray-800 text-sm"
          >
            {expandedCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            📊 Urutkan
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white text-gray-800 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filter Toggle */}
        <div className="lg:col-span-1">
          <button
            type="button"
            onClick={onToggleAdvanced}
            className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg transition-all duration-300 flex items-center justify-center ${
              showAdvanced
                ? "bg-tosca-100 text-tosca-700 border-tosca-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Filter Lanjutan"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Advanced filters component - Compact version
function AdvancedFilters({
  showAdvanced,
  setShowAdvanced,
  priceRange,
  setPriceRange,
  selectedRegions,
  setSelectedRegions,
  selectedCities,
  setSelectedCities,
  availableRegions,
  availableCities,
  marketStatuses,
  selectedMarketStatus,
  setSelectedMarketStatus,
  landArea,
  setLandArea,
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  paymentMethod,
  setPaymentMethod,
}) {
  const paymentMethods = [
    "Cash Keras",
    "Cash Bertahap",
    "KPR",
    "In House",
    "Kredit Bank",
  ];

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAdvanced(false);
    }
  };

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowAdvanced(false);
      }
    };

    if (showAdvanced) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll

      // Focus on modal for accessibility
      const modalElement = document.querySelector(
        '[data-modal="advanced-filters"]'
      );
      if (modalElement) {
        modalElement.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showAdvanced, setShowAdvanced]);

  if (!showAdvanced) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
      data-modal="advanced-filters"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop with improved blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in-0"></div>

      {/* Modal with enhanced animations */}
      <div className="relative min-h-screen md:min-h-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="relative bg-white w-full md:max-w-5xl md:mx-auto md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 md:zoom-in-95 duration-500 md:duration-300">
          {/* Header with better styling */}
          <div className="sticky top-0 px-4 md:px-6 py-4 bg-tosca-50 border-b border-gray-200 md:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-tosca-500 rounded-xl shadow-lg">
                  <SlidersHorizontal size={20} className="text-white" />
                </div>
                <div>
                  <h3
                    id="modal-title"
                    className="font-bold text-gray-800 text-lg"
                  >
                    Filter Lanjutan
                  </h3>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Sesuaikan pencarian dengan kebutuhan Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvanced(false)}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                title="Tutup filter lanjutan"
                aria-label="Tutup modal filter lanjutan"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Mobile Full Screen / Desktop Contained */}
          <div className="px-4 md:px-6 py-6 max-h-[calc(100vh-120px)] md:max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Price Range */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  💰 <span>Rentang Harga (Miliar)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Harga minimum"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Harga maksimum"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                  />
                </div>
              </div>

              {/* Land Area */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  📐 <span>Luas Tanah (m²)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Luas minimum"
                    value={landArea.min}
                    onChange={(e) =>
                      setLandArea((prev) => ({ ...prev, min: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Luas maksimum"
                    value={landArea.max}
                    onChange={(e) =>
                      setLandArea((prev) => ({ ...prev, max: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🛏️ <span>Kamar Tidur</span>
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                >
                  <option value="">Semua</option>
                  <option value="1">1 Kamar</option>
                  <option value="2">2 Kamar</option>
                  <option value="3">3 Kamar</option>
                  <option value="4">4 Kamar</option>
                  <option value="5+">5+ Kamar</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🚿 <span>Kamar Mandi</span>
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                >
                  <option value="">Semua</option>
                  <option value="1">1 Kamar Mandi</option>
                  <option value="2">2 Kamar Mandi</option>
                  <option value="3">3 Kamar Mandi</option>
                  <option value="4+">4+ Kamar Mandi</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  💳 <span>Metode Pembayaran</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                >
                  <option value="">Semua Metode</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Market Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  📊 <span>Status Pasar</span>
                </label>
                <select
                  value={selectedMarketStatus}
                  onChange={(e) => setSelectedMarketStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all"
                >
                  <option value="">Semua Status</option>
                  {marketStatuses.map((status) => {
                    const statusValue = typeof status === 'object' ? status.name : status;
                    const statusKey = typeof status === 'object' ? status._id || status.name : status;
                    return (
                      <option key={statusKey} value={statusValue}>
                        {statusValue}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Location filters in a separate row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <MultiSelectDropdown
                  label="🌍 Wilayah"
                  options={availableRegions}
                  selectedOptions={selectedRegions}
                  onSelectionChange={setSelectedRegions}
                  placeholder="Pilih wilayah..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <MultiSelectDropdown
                  label="🏙️ Kota"
                  options={availableCities}
                  selectedOptions={selectedCities}
                  onSelectionChange={setSelectedCities}
                  placeholder="Pilih kota..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions with enhanced styling */}
          <div className="sticky bottom-0 px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200 md:rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-6 py-2.5 text-gray-600 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium transform hover:scale-[1.02] shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-8 py-2.5 bg-tosca-500 text-white rounded-xl hover:bg-tosca-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Multi-select dropdown component
function MultiSelectDropdown({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionToggle = (option) => {
    const isSelected = selectedOptions.includes(option);
    if (isSelected) {
      onSelectionChange(selectedOptions.filter((item) => item !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  return (
    <div className="dropdown-container relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:border-tosca-500 focus:ring-1 focus:ring-tosca-200 transition-all flex justify-between items-center"
      >
        <span
          className={selectedOptions.length ? "text-gray-900" : "text-gray-500"}
        >
          {selectedOptions.length
            ? `${selectedOptions.length} dipilih`
            : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleOptionToggle(option)}
                  className="mr-3 rounded border-gray-300 text-tosca-600 focus:ring-tosca-500"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Reset Filters component
function ResetFilters({ onReset, hasActiveFilters }) {
  if (!hasActiveFilters) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-lg">
            <RotateCcw size={20} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-red-800">Filter Aktif</span>
            <p className="text-sm text-red-600">
              Ada filter yang sedang diterapkan
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Setel Ulang Semua Filter
        </button>
      </div>
    </div>
  );
}

// Properties Grid component
function PropertiesGrid({ properties }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Tidak Ada Properti Ditemukan
        </h3>
        <p className="text-gray-600">
          Coba ubah kriteria pencarian atau filter Anda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="animate-in slide-in-from-bottom-2"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}

// Statistics component
function PropertyStatistics({ properties, currentFilter, searchQuery }) {
  const totalProperties = properties.length;
  const averagePrice =
    properties.reduce((sum, prop) => sum + (prop.startPrice || 0), 0) /
      totalProperties || 0;

  const typeDistribution = properties.reduce((acc, prop) => {
    const type = typeof prop.assetType === 'object' 
      ? (prop.assetType?.name || "Unknown")
      : (prop.assetType || "Unknown");
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-in slide-in-from-top-2">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-tosca-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
        Statistik Properti
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-tosca-50 rounded-lg p-4 border border-tosca-200">
          <div className="text-2xl font-bold text-tosca-700">
            {totalProperties.toLocaleString()}
          </div>
          <div className="text-sm text-tosca-600">Total Properti</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {averagePrice > 0
              ? `${(averagePrice / 1000000000).toFixed(1)}M`
              : "N/A"}
          </div>
          <div className="text-sm text-blue-600">Rata-rata Harga</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {Object.keys(typeDistribution).length}
          </div>
          <div className="text-sm text-green-600">Jenis Properti</div>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function PropertiesClient({
  properties: allProperties = [],
  assetTypes = [],
  marketStatuses = [],
}) {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced filter states
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedMarketStatus, setSelectedMarketStatus] = useState("");
  const [landArea, setLandArea] = useState({ min: "", max: "" });
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Extract unique regions and cities from properties
  const availableRegions = useMemo(() => {
    const regions = allProperties
      .map((property) => property.location?.region)
      .filter(Boolean)
      .filter((region, index, array) => array.indexOf(region) === index);
    return regions.sort();
  }, [allProperties]);

  const availableCities = useMemo(() => {
    const cities = allProperties
      .map((property) => property.location?.city)
      .filter(Boolean)
      .filter((city, index, array) => array.indexOf(city) === index);
    return cities.sort();
  }, [allProperties]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery ||
      currentFilter ||
      priceRange.min ||
      priceRange.max ||
      selectedRegions.length > 0 ||
      selectedCities.length > 0 ||
      selectedMarketStatus ||
      landArea.min ||
      landArea.max ||
      bedrooms ||
      bathrooms ||
      paymentMethod
    );
  }, [
    searchQuery,
    currentFilter,
    priceRange,
    selectedRegions,
    selectedCities,
    selectedMarketStatus,
    landArea,
    bedrooms,
    bathrooms,
    paymentMethod,
  ]);

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setCurrentFilter("");
    setSortBy("newest");
    setPriceRange({ min: "", max: "" });
    setSelectedRegions([]);
    setSelectedCities([]);
    setSelectedMarketStatus("");
    setLandArea({ min: "", max: "" });
    setBedrooms("");
    setBathrooms("");
    setPaymentMethod("");
    setShowAdvanced(false);
  };

  // Process and filter properties
  const processedProperties = useMemo(() => {
    let filtered = [...allProperties];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((property) => {
        return (
          property.name?.toLowerCase().includes(query) ||
          property.location?.region?.toLowerCase().includes(query) ||
          property.location?.city?.toLowerCase().includes(query) ||
          property.developer?.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query)
        );
      });
    }

    // Apply asset type filter
    if (currentFilter) {
      filtered = filtered.filter((property) => {
        const propertyAssetType = typeof property.assetType === 'object' 
          ? property.assetType?.name 
          : property.assetType;
        return propertyAssetType === currentFilter;
      });
    }

    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((property) => {
        const price = property.startPrice || 0;
        const minPrice = priceRange.min
          ? parseFloat(priceRange.min) * 1000000000
          : 0;
        const maxPrice = priceRange.max
          ? parseFloat(priceRange.max) * 1000000000
          : Infinity;

        return price >= minPrice && price <= maxPrice;
      });
    }

    // Apply market status filter
    if (selectedMarketStatus) {
      filtered = filtered.filter((property) => {
        const propertyMarketStatus = typeof property.marketStatus === 'object' 
          ? property.marketStatus?.name 
          : property.marketStatus;
        const propertyStatus = typeof property.status === 'object' 
          ? property.status?.name 
          : property.status;
        
        return (
          propertyMarketStatus === selectedMarketStatus ||
          propertyStatus === selectedMarketStatus
        );
      });
    }

    // Apply land area filter
    if (landArea.min || landArea.max) {
      filtered = filtered.filter((property) => {
        const area = property.specs?.landArea || property.landArea || 0;
        const minArea = landArea.min ? parseFloat(landArea.min) : 0;
        const maxArea = landArea.max ? parseFloat(landArea.max) : Infinity;

        return area >= minArea && area <= maxArea;
      });
    }

    // Apply bedrooms filter
    if (bedrooms) {
      filtered = filtered.filter((property) => {
        const propBedrooms = property.specs?.bedrooms || property.bedrooms || 0;
        if (bedrooms === "5+") {
          return propBedrooms >= 5;
        } else {
          return propBedrooms === parseInt(bedrooms);
        }
      });
    }

    // Apply bathrooms filter
    if (bathrooms) {
      filtered = filtered.filter((property) => {
        const propBathrooms =
          property.specs?.bathrooms || property.bathrooms || 0;
        if (bathrooms === "4+") {
          return propBathrooms >= 4;
        } else {
          return propBathrooms === parseInt(bathrooms);
        }
      });
    }

    // Apply payment method filter
    if (paymentMethod) {
      filtered = filtered.filter((property) => {
        const methods = property.paymentMethods || [];
        return methods.includes(paymentMethod);
      });
    }

    // Apply region filter
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((property) =>
        selectedRegions.includes(property.location?.region)
      );
    }

    // Apply city filter
    if (selectedCities.length > 0) {
      filtered = filtered.filter((property) =>
        selectedCities.includes(property.location?.city)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "price_low":
          return (a.startPrice || 0) - (b.startPrice || 0);
        case "price_high":
          return (b.startPrice || 0) - (a.startPrice || 0);
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        default: // newest
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  }, [
    allProperties,
    searchQuery,
    currentFilter,
    priceRange,
    selectedRegions,
    selectedCities,
    selectedMarketStatus,
    landArea,
    bedrooms,
    bathrooms,
    paymentMethod,
    sortBy,
  ]);

  return (
    <div className="space-y-6">
      {/* Reset Filters */}
      <ResetFilters
        onReset={resetAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Combined Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        availableRegions={availableRegions}
        availableCities={availableCities}
        assetTypes={assetTypes}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
      />

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedRegions={selectedRegions}
        setSelectedRegions={setSelectedRegions}
        selectedCities={selectedCities}
        setSelectedCities={setSelectedCities}
        availableRegions={availableRegions}
        availableCities={availableCities}
        marketStatuses={marketStatuses}
        selectedMarketStatus={selectedMarketStatus}
        setSelectedMarketStatus={setSelectedMarketStatus}
        landArea={landArea}
        setLandArea={setLandArea}
        bedrooms={bedrooms}
        setBedrooms={setBedrooms}
        bathrooms={bathrooms}
        setBathrooms={setBathrooms}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      {/* Statistics */}
      <PropertyStatistics
        properties={processedProperties}
        currentFilter={currentFilter}
        searchQuery={searchQuery}
      />

      {/* Results Summary */}
      <div className="bg-tosca-50 rounded-lg p-4 border border-tosca-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg
                className="w-5 h-5 text-tosca-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">
                Menampilkan{" "}
                <span className="text-tosca-600 font-bold">
                  {processedProperties.length.toLocaleString()}
                </span>{" "}
                dari {allProperties.length.toLocaleString()} properti
              </p>
              <p className="text-sm text-gray-600">
                {processedProperties.length === allProperties.length
                  ? "Semua properti ditampilkan"
                  : `${(
                      (processedProperties.length / allProperties.length) *
                      100
                    ).toFixed(1)}% dari total properti`}
              </p>
            </div>
          </div>

          {/* Additional reset button in results */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Hapus Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Properties Grid */}
      <PropertiesGrid properties={processedProperties} />
    </div>
  );
}

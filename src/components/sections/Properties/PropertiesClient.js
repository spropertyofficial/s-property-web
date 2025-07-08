'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '@/components/common/PropertyCard/PropertyCard';

// Filter component
function PropertyFilters({ assetTypes, currentFilter, onFilterChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <span className="font-medium text-gray-700">Filter Properti:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentFilter === '' 
                ? 'bg-tosca-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua Properti
          </button>
          
          {assetTypes.map((type) => (
            <button
              key={type._id}
              onClick={() => onFilterChange(type.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentFilter === type.name 
                  ? 'bg-tosca-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Search component
function PropertySearch({ searchQuery, onSearch }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari properti berdasarkan nama, lokasi, atau developer..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Advanced filters component
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
  setSelectedMarketStatus
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-gray-700 hover:text-tosca-500 transition-colors"
      >
        <SlidersHorizontal size={20} />
        <span className="font-medium">Filter Lanjutan</span>
        <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {showAdvanced && (
        <div className="mt-4 space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rentang Harga (Miliar)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-500"
              />
            </div>
          </div>

          {/* Market Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Pasar
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMarketStatus('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedMarketStatus === '' 
                    ? 'bg-tosca-100 text-tosca-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              {marketStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedMarketStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedMarketStatus === status 
                      ? 'bg-tosca-100 text-tosca-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wilayah
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRegions.map((region) => (
                <label key={region} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRegions([...selectedRegions, region]);
                      } else {
                        setSelectedRegions(selectedRegions.filter(r => r !== region));
                      }
                    }}
                    className="rounded border-gray-300 text-tosca-500 focus:ring-tosca-500"
                  />
                  <span className="text-sm text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kota
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCities.map((city) => (
                <label key={city} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCities([...selectedCities, city]);
                      } else {
                        setSelectedCities(selectedCities.filter(c => c !== city));
                      }
                    }}
                    className="rounded border-gray-300 text-tosca-500 focus:ring-tosca-500"
                  />
                  <span className="text-sm text-gray-700">{city}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Properties grid component
function PropertiesGrid({ properties }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <MapPin size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Tidak ada properti yang ditemukan
        </h3>
        <p className="text-gray-500">
          Coba ubah filter atau kata kunci pencarian Anda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property._id || property.id}
          type="residentials"
          data={{
            id: property.id,
            name: property.name,
            location: property.location,
            gallery: property.gallery || [],
            startPrice: property.startPrice,
            developer: property.developer,
            assetType: property.assetType,
            marketStatus: property.marketStatus,
            listingStatus: property.listingStatus
          }}
        />
      ))}
    </div>
  );
}

// Main client component
export default function PropertiesClient({ allProperties, assetTypes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedMarketStatus, setSelectedMarketStatus] = useState('');

  // Get available filter options
  const availableRegions = useMemo(() => 
    [...new Set(allProperties.map(p => p.location?.region).filter(Boolean))],
    [allProperties]
  );

  const availableCities = useMemo(() => 
    [...new Set(allProperties.map(p => p.location?.city).filter(Boolean))],
    [allProperties]
  );

  const marketStatuses = useMemo(() => 
    [...new Set(allProperties.map(p => p.marketStatus?.name).filter(Boolean))],
    [allProperties]
  );

  // Filter properties based on all criteria
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = property.name?.toLowerCase() || '';
        const region = property.location?.region?.toLowerCase() || '';
        const city = property.location?.city?.toLowerCase() || '';
        const area = property.location?.area?.toLowerCase() || '';
        const developer = property.developer?.toLowerCase() || '';
        
        const matchesSearch = name.includes(query) || 
                             region.includes(query) || 
                             city.includes(query) || 
                             area.includes(query) || 
                             developer.includes(query);
        
        if (!matchesSearch) return false;
      }

      // Asset type filter
      if (currentFilter && property.assetType?.name !== currentFilter) {
        return false;
      }

      // Price range filter
      if (priceRange.min || priceRange.max) {
        const price = property.startPrice || 0;
        const minPrice = priceRange.min ? parseFloat(priceRange.min) * 1000000000 : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) * 1000000000 : Infinity;
        
        if (price < minPrice || price > maxPrice) {
          return false;
        }
      }

      // Region filter
      if (selectedRegions.length > 0 && !selectedRegions.includes(property.location?.region)) {
        return false;
      }

      // City filter
      if (selectedCities.length > 0 && !selectedCities.includes(property.location?.city)) {
        return false;
      }

      // Market status filter
      if (selectedMarketStatus && property.marketStatus?.name !== selectedMarketStatus) {
        return false;
      }

      return true;
    });
  }, [allProperties, searchQuery, currentFilter, priceRange, selectedRegions, selectedCities, selectedMarketStatus]);

  return (
    <div>
      {/* Search */}
      <PropertySearch 
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      {/* Basic Filters */}
      <PropertyFilters 
        assetTypes={assetTypes}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      {/* Advanced Filters */}
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
      />

      {/* Results count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Menampilkan <span className="font-semibold text-tosca-600">{filteredProperties.length}</span> dari {allProperties.length} properti
        </p>
      </div>

      {/* Properties Grid */}
      <PropertiesGrid properties={filteredProperties} />
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';
import PropertyCard from '@/components/common/PropertyCard/PropertyCard';

// Enhanced Filter component with expanded categories
function PropertyFilters({ assetTypes, currentFilter, onFilterChange }) {
  // Expanded property categories
  const expandedCategories = [
    { name: 'Semua Properti', value: '' },
    { name: 'Perumahan', value: 'Perumahan' },
    { name: 'Apartemen', value: 'Apartemen' },
    { name: 'Tanah', value: 'Tanah' },
    { name: 'Ruko', value: 'Ruko' },
    { name: 'Komersial', value: 'Komersial' },
    ...assetTypes.filter(type => 
      !['Perumahan', 'Apartemen', 'Tanah', 'Ruko', 'Komersial'].includes(type.name)
    ).map(type => ({ name: type.name, value: type.name }))
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-in slide-in-from-top-2">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tosca-500 rounded-lg">
            <Filter size={20} className="text-white" />
          </div>
          <span className="font-semibold text-gray-800">Kategori Properti</span>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {expandedCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => onFilterChange(category.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                currentFilter === category.value 
                  ? 'bg-tosca-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced Search component with better placeholder
function PropertySearch({ searchQuery, onSearch, availableRegions, availableCities }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Generate location suggestions based on input
  const locationSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const regions = availableRegions.filter(region => 
      region.toLowerCase().includes(query)
    ).map(region => ({ type: 'region', value: region }));
    
    const cities = availableCities.filter(city => 
      city.toLowerCase().includes(query)
    ).map(city => ({ type: 'city', value: city }));
    
    return [...regions, ...cities].slice(0, 8);
  }, [searchQuery, availableRegions, availableCities]);

  const handleSuggestionClick = (suggestion) => {
    onSearch(suggestion.value);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-in slide-in-from-top-2">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-tosca-500 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="🔍 Cari properti berdasarkan nama, lokasi, wilayah, kota, developer, atau kata kunci lainnya..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-12 pr-6 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300 bg-white placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {/* Location suggestions dropdown */}
        {showSuggestions && locationSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2 px-2">Saran Lokasi:</div>
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm">{suggestion.value}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {suggestion.type === 'region' ? 'Wilayah' : 'Kota'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Advanced filters component
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
  setPaymentMethod
}) {
  const paymentMethods = [
    'Cash Keras', 'Cash Bertahap', 'KPR', 'In House', 'Kredit Bank'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-in slide-in-from-top-2">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-3 text-gray-800 hover:text-tosca-600 transition-all duration-300 group w-full"
      >
        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-tosca-50 transition-colors">
          <SlidersHorizontal size={20} className="group-hover:text-tosca-600" />
        </div>
        <span className="font-semibold">Filter Lanjutan</span>
        <span className={`transform transition-transform duration-300 ml-auto ${showAdvanced ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      
      {showAdvanced && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
          {/* Price Range */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              💰 Rentang Harga (Miliar Rupiah)
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Harga Minimum"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300"
                />
              </div>
              <div className="text-gray-400 font-medium">—</div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Harga Maksimum"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Land Area */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              📐 Luas Tanah (m²)
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Luas Minimum"
                  value={landArea.min}
                  onChange={(e) => setLandArea(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300"
                />
              </div>
              <div className="text-gray-400 font-medium">—</div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Luas Maksimum"
                  value={landArea.max}
                  onChange={(e) => setLandArea(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Room Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bedrooms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                🛏️ Jumlah Kamar Tidur
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300"
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
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                🚿 Jumlah Kamar Mandi
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-tosca-500 focus:ring-2 focus:ring-tosca-100 transition-all duration-300"
              >
                <option value="">Semua</option>
                <option value="1">1 Kamar Mandi</option>
                <option value="2">2 Kamar Mandi</option>
                <option value="3">3 Kamar Mandi</option>
                <option value="4+">4+ Kamar Mandi</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              💳 Metode Pembayaran
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPaymentMethod('')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  paymentMethod === '' 
                    ? 'bg-tosca-500 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Semua Metode
              </button>
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    paymentMethod === method 
                      ? 'bg-tosca-500 text-white shadow-lg' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Market Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              📊 Status Pasar
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMarketStatus('')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedMarketStatus === '' 
                    ? 'bg-tosca-500 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Semua Status
              </button>
              {marketStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedMarketStatus(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedMarketStatus === status 
                      ? 'bg-tosca-500 text-white shadow-lg' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              🗺️ Wilayah
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableRegions.map((region) => (
                <label key={region} className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]">
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
                    className="w-4 h-4 rounded border-gray-300 text-tosca-500 focus:ring-tosca-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              🏙️ Kota
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {availableCities.map((city) => (
                <label key={city} className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]">
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
                    className="w-4 h-4 rounded border-gray-300 text-tosca-500 focus:ring-tosca-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{city}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sorting component
function PropertySorting({ sortBy, onSortChange }) {
  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: '🕐' },
    { value: 'oldest', label: 'Terlama', icon: '📅' },
    { value: 'price_low', label: 'Harga Terendah', icon: '💰' },
    { value: 'price_high', label: 'Harga Tertinggi', icon: '💎' },
    { value: 'name_asc', label: 'Nama A-Z', icon: '🔤' },
    { value: 'name_desc', label: 'Nama Z-A', icon: '🔡' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-in slide-in-from-top-2">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <ArrowUpDown size={20} className="text-white" />
          </div>
          <span className="font-semibold text-gray-800">Urutkan</span>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                sortBy === option.value 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Properties grid component
function PropertiesGrid({ properties }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 animate-in fade-in-0">
        <div className="bg-gray-100 rounded-lg p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center animate-bounce">
          <MapPin size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          Tidak ada properti yang ditemukan
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Coba ubah filter pencarian, kata kunci, atau kriteria lainnya untuk menemukan properti yang sesuai
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property, index) => (
        <div
          key={property._id || property.id}
          className="animate-in fade-in-0 slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PropertyCard
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
        </div>
      ))}
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
            <p className="text-sm text-red-600">Ada filter yang sedang diterapkan</p>
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

// Main client component
export default function PropertiesClient({ allProperties, assetTypes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedMarketStatus, setSelectedMarketStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // New advanced filter states
  const [landArea, setLandArea] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

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

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery || currentFilter || priceRange.min || priceRange.max || 
           selectedRegions.length > 0 || selectedCities.length > 0 || 
           selectedMarketStatus || landArea.min || landArea.max || 
           bedrooms || bathrooms || paymentMethod;
  }, [searchQuery, currentFilter, priceRange, selectedRegions, selectedCities, 
      selectedMarketStatus, landArea, bedrooms, bathrooms, paymentMethod]);

  // Reset all filters function
  const resetAllFilters = () => {
    setSearchQuery('');
    setCurrentFilter('');
    setPriceRange({ min: '', max: '' });
    setSelectedRegions([]);
    setSelectedCities([]);
    setSelectedMarketStatus('');
    setLandArea({ min: '', max: '' });
    setBedrooms('');
    setBathrooms('');
    setPaymentMethod('');
    setSortBy('newest');
  };

  // Filter and sort properties
  const processedProperties = useMemo(() => {
    let filtered = allProperties.filter(property => {
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

      // Land area filter (assuming it's stored in property specs)
      if (landArea.min || landArea.max) {
        const area = property.specs?.landArea || property.landArea || 0;
        const minArea = landArea.min ? parseFloat(landArea.min) : 0;
        const maxArea = landArea.max ? parseFloat(landArea.max) : Infinity;
        
        if (area < minArea || area > maxArea) {
          return false;
        }
      }

      // Bedrooms filter
      if (bedrooms) {
        const propBedrooms = property.specs?.bedrooms || property.bedrooms || 0;
        if (bedrooms === '5+') {
          if (propBedrooms < 5) return false;
        } else {
          if (propBedrooms !== parseInt(bedrooms)) return false;
        }
      }

      // Bathrooms filter
      if (bathrooms) {
        const propBathrooms = property.specs?.bathrooms || property.bathrooms || 0;
        if (bathrooms === '4+') {
          if (propBathrooms < 4) return false;
        } else {
          if (propBathrooms !== parseInt(bathrooms)) return false;
        }
      }

      // Payment method filter
      if (paymentMethod) {
        const methods = property.paymentMethods || [];
        if (!methods.includes(paymentMethod)) return false;
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

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
        case 'oldest':
          return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
        case 'price_low':
          return (a.startPrice || 0) - (b.startPrice || 0);
        case 'price_high':
          return (b.startPrice || 0) - (a.startPrice || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [allProperties, searchQuery, currentFilter, priceRange, selectedRegions, selectedCities, 
      selectedMarketStatus, landArea, bedrooms, bathrooms, paymentMethod, sortBy]); 
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

  // Sort properties based on selected criteria
  const sortedProperties = useMemo(() => {
    const propertiesToSort = [...filteredProperties];
    
    switch (sortBy) {
      case 'newest':
        return propertiesToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return propertiesToSort.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'price_low':
        return propertiesToSort.sort((a, b) => (a.startPrice || 0) - (b.startPrice || 0));
      case 'price_high':
        return propertiesToSort.sort((a, b) => (b.startPrice || 0) - (a.startPrice || 0));
      case 'name_asc':
        return propertiesToSort.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return propertiesToSort.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return propertiesToSort;
    }
  }, [filteredProperties, sortBy]);

  return (
    <div className="space-y-6">
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

      {/* Sorting Component */}
      <PropertySorting
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Results Summary */}
      <div className="bg-tosca-50 rounded-lg p-4 border border-tosca-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-tosca-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">
                Menampilkan <span className="text-tosca-600 font-bold">{filteredProperties.length.toLocaleString()}</span> dari {allProperties.length.toLocaleString()} properti
              </p>
              <p className="text-sm text-gray-600">
                {filteredProperties.length === allProperties.length 
                  ? "Semua properti ditampilkan" 
                  : `${(filteredProperties.length / allProperties.length * 100).toFixed(1)}% dari total properti`
                }
              </p>
            </div>
          </div>
          
          {/* Clear filters button */}
          {(searchQuery || currentFilter || priceRange.min || priceRange.max || selectedRegions.length > 0 || selectedCities.length > 0 || selectedMarketStatus) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentFilter('');
                setPriceRange({ min: '', max: '' });
                setSelectedRegions([]);
                setSelectedCities([]);
                setSelectedMarketStatus('');
              }}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Reset Filters Component */}
      <ResetFilters 
        onReset={() => {
          setSearchQuery('');
          setCurrentFilter('');
          setPriceRange({ min: '', max: '' });
          setSelectedRegions([]);
          setSelectedCities([]);
          setSelectedMarketStatus('');
          setShowAdvanced(false);
        }}
        hasActiveFilters={
          searchQuery || 
          currentFilter || 
          priceRange.min || 
          priceRange.max || 
          selectedRegions.length > 0 || 
          selectedCities.length > 0 || 
          selectedMarketStatus
        }
      />

      {/* Properties Grid */}
      <PropertiesGrid properties={sortedProperties} />
    </div>
  );
}

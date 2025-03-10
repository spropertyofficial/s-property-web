'use client'

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import TabNav from "./components/TabNav";
import { residentialsData } from "@/data/residentials";

export default function SearchSection() {
  const [activeTab, setActiveTab] = useState('Dijual');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results = residentialsData.filter(property => {
      return (
        // Search by property name
        property.name.toLowerCase().includes(searchTerm) ||
        // Search by location details
        property.location.region.toLowerCase().includes(searchTerm) ||
        property.location.city.toLowerCase().includes(searchTerm) ||
        property.location.area.toLowerCase().includes(searchTerm) ||
        property.location.address.toLowerCase().includes(searchTerm) ||
        // Search by developer
        property.developer.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(results);
  };

  return (
    <div className="relative lg:px-20">
      <div className="absolute inset-0 bg-tosca-200"></div>
      <div className="relative px-6 pb-8 pt-6">
        <h1 className="text-white text-xl font-medium mb-4">
          Jual Beli Sewa KPR Properti
        </h1>
        
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <SearchBar 
          onSearch={handleSearch} 
          activeTab={activeTab} 
          searchResults={searchResults}
        />
      </div>
    </div>
  )
}
'use client'

import { Search } from "lucide-react";
import SearchResults from "./SearchResults";
import { useState } from "react";

export default function SearchBar({ onSearch, searchResults }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center bg-white rounded-lg">
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="Cari berdasarkan lokasi, area, atau nama properti"
          className="w-full py-3 px-3 rounded-lg focus:outline-none"
          value={query}
          onChange={handleChange}
        />
      </div>
      <SearchResults results={searchResults} />
    </div>
  );
}

import { Search, Filter } from 'lucide-react'

export default function SearchBar() {
  return (
    <div className="space-y-3">
      <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-3 shadow-lg">
        <Search size={20} className="text-gray-300 min-w-[20px]" />
        <input 
          type="text"
          placeholder="Lokasi, kata kunci, area, proyek..."
          className="flex-1 ml-3 outline-none text-sm text-gray-600 placeholder:text-gray-300"
        />
        <button className="hover:text-tosca-200 transition-colors">
          <Filter size={20} className="text-gray-300" />
        </button>
      </div>
      <button className="w-full bg-tosca-100 text-white py-3 rounded-lg font-medium 
                       hover:bg-tosca-300 active:bg-tosca-400 
                       transition-colors focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-tosca-200
                       shadow-lg">
        Cari
      </button>
    </div>
  )
}
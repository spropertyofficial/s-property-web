import { Search, Menu, Filter } from 'lucide-react'
import Image from 'next/image'

export default function Header() {
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="bg-white">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <button className="text-tosca-200 hover:text-tosca-50 transition-colors">
              <Menu size={30} />
            </button>
            <Image
                src="/images/logo.png"
                alt="S-Property"
                width={120}
                height={40}
                priority
              />
            <div className="w-8"></div>
          </div>
        </div>
      </div>

      {/* Search Section dengan overlay */}
      <div className="relative">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-tosca-200"></div>

        {/* Content */}
        <div className="relative px-6 pb-8 pt-6">
          <h1 className="text-white text-xl font-medium mb-4">Jual Beli Sewa KPR Properti</h1>
          
          <div className="flex gap-6 mb-4 overflow-x-auto hide-scrollbar">
            <button className="text-white border-b-2 border-white pb-1 whitespace-nowrap font-medium">
              Dijual
            </button>
            <button className="text-white/80 whitespace-nowrap hover:text-white transition-colors">
              Disewa
            </button>
            <button className="text-white/80 whitespace-nowrap hover:text-white transition-colors">
              Proyek Baru
            </button>
          </div>

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
        </div>
      </div>
    </div>
  )
}
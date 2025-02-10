export default function TabNav() {
    return (
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
    )
  }
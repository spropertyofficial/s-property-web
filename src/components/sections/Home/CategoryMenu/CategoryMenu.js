import { Home, Building2, Building, Map, Users, Calculator } from 'lucide-react'

export default function CategoryMenu() {
  const categories = [
    { icon: <Home size={24} />, label: 'Rumah' },
    { icon: <Building2 size={24} />, label: 'Ruko' },
    { icon: <Building size={24} />, label: 'Kavling' },
    { icon: <Map size={24} />, label: 'Tanah' },
    { icon: <Users size={24} />, label: 'Join S-Pro' },
    { icon: <Calculator size={24} />, label: 'Simulasi KPR' },
  ]

  return (
    <div className="px-6 py-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <button 
            key={index}
            className="flex flex-col items-center group"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full 
                          bg-tosca-200
                          border border-tosca-100/20
                          group-hover:bg-tosca-100 group-hover:shadow-lg
                          group-hover:translate-y-[-2px]
                          drop-shadow-xl
                          transition-all duration-200">
              <div className="text-white group-hover:text-white transition-colors">
                {category.icon}
              </div>
            </div>
            <span className="text-sm text-gray-600 text-center w-[80px] break-words mt-2
                           group-hover:text-tosca-200 transition-colors">
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
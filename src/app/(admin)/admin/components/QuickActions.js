import Link from 'next/link'
import { FaBuilding, FaLayerGroup, FaDoorOpen, FaPlus } from 'react-icons/fa'

export default function QuickActions() {
  const quickActions = [
    {
      title: 'Add Residential',
      description: 'Create a new residential property listing',
      icon: <FaBuilding className="text-blue-600" />,
      path: '/admin/residential/new',
      color: 'hover:bg-blue-50',
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Add Cluster',
      description: 'Create a new cluster within a residential',
      icon: <FaLayerGroup className="text-green-600" />,
      path: '/admin/clusters/new',
      color: 'hover:bg-green-50',
      iconBg: 'bg-green-50'
    },
    {
      title: 'Add Unit Type',
      description: 'Create a new unit type for a cluster',
      icon: <FaDoorOpen className="text-purple-600" />,
      path: '/admin/types/new',
      color: 'hover:bg-purple-50',
      iconBg: 'bg-purple-50'
    }
  ]

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-600">Tambahkan data baru dengan cepat</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link 
            key={index} 
            href={action.path}
            className={`group bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${action.color} hover:shadow-md transition-all duration-200 hover:border-gray-300`}
          >
            <div className="flex items-start gap-4">
              <div className={`${action.iconBg} p-3 rounded-lg group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <FaPlus className="text-xs text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
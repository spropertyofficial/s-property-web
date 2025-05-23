import Link from 'next/link'
import { FaBuilding, FaLayerGroup, FaDoorOpen } from 'react-icons/fa'

export default function QuickActions() {
  const quickActions = [
    {
      title: 'Add Residential',
      description: 'Create a new residential property listing',
      icon: <FaBuilding className="text-blue-500" />,
      path: '/admin/residential/new',
      color: 'bg-blue-50'
    },
    {
      title: 'Add Cluster',
      description: 'Create a new cluster within a residential',
      icon: <FaLayerGroup className="text-green-500" />,
      path: '/admin/clusters/new',
      color: 'bg-green-50'
    },
    {
      title: 'Add Unit Type',
      description: 'Create a new unit type for a cluster',
      icon: <FaDoorOpen className="text-purple-500" />,
      path: '/admin/types/new',
      color: 'bg-purple-50'
    }
  ]

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-500 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link 
            key={index} 
            href={action.path}
            className={`${action.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">{action.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
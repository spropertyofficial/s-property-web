import Link from 'next/link'
import { FaBuilding, FaLayerGroup, FaDoorOpen, FaUsers, FaExternalLinkAlt } from 'react-icons/fa'

export default function RecentActivity({ loading }) {
  const activities = [
    {
      icon: FaBuilding,
      color: "blue",
      title: "New residential property added",
      subtitle: "Perumahan Griya Indah",
      time: "Today, 10:30 AM"
    },
    {
      icon: FaLayerGroup,
      color: "green", 
      title: "Cluster updated",
      subtitle: "Cluster Adora - Price updated",
      time: "Yesterday, 3:45 PM"
    },
    {
      icon: FaDoorOpen,
      color: "purple",
      title: "New unit type created", 
      subtitle: "Type 45/90 - Adora Cluster",
      time: "2 days ago, 9:15 AM"
    },
    {
      icon: FaUsers,
      color: "orange",
      title: "Admin user added",
      subtitle: "New admin: John Doe",
      time: "3 days ago, 2:20 PM"
    }
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "text-green-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600" }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600">Latest updates and changes</p>
        </div>
        <Link 
          href="/admin/activity" 
          className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 font-medium"
        >
          View All <FaExternalLinkAlt className="text-xs" />
        </Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            const colors = colorClasses[activity.color];
            
            return (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`${colors.bg} p-2.5 rounded-lg`}>
                  <IconComponent className={`${colors.icon} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
import { FaBuilding, FaLayerGroup, FaDoorOpen, FaTable } from 'react-icons/fa'

export default function StatsOverview({ stats, loading }) {
  const statsData = [
    {
      title: "Total Residentials",
      value: stats.residentials,
      icon: FaBuilding,
      color: "blue",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Total Clusters", 
      value: stats.clusters,
      icon: FaLayerGroup,
      color: "green",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Unit Types",
      value: stats.units,
      icon: FaDoorOpen,
      color: "purple",
      change: "+5%",
      changeType: "increase"
    }
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100"
    },
    green: {
      bg: "bg-green-50", 
      icon: "text-green-600",
      border: "border-green-100"
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600", 
      border: "border-purple-100"
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-600">Ringkasan data properti terkini</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          const colors = colorClasses[stat.color];
          
          return (
            <div key={index} className={`bg-white rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${colors.bg} p-3 rounded-lg`}>
                    <IconComponent className={`${colors.icon} text-xl`} />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <FaTable className="text-xs" />
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  )
}
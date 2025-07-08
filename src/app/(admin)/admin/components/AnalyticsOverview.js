import { FaChartLine, FaEye, FaUsers, FaPercent } from 'react-icons/fa'

export default function AnalyticsOverview({ loading }) {
  const analyticsData = [
    {
      title: "Page Views",
      value: "12,543",
      change: "+14.3%",
      icon: FaEye,
      color: "blue"
    },
    {
      title: "Unique Visitors", 
      value: "4,876",
      change: "+8.1%",
      icon: FaUsers,
      color: "green"
    },
    {
      title: "Conversion Rate",
      value: "3.2%", 
      change: "+2.4%",
      icon: FaPercent,
      color: "purple"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-600">Performance last 30 days</p>
        </div>
        <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
          Last 30 days
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {analyticsData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="text-gray-500 text-sm" />
                    <p className="text-sm text-gray-600">{item.title}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{item.value}</h3>
                    <span className="text-xs text-green-600 font-medium">{item.change}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <FaChartLine className="text-gray-400 text-3xl mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
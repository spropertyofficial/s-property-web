import { FaChartLine } from 'react-icons/fa'

export default function AnalyticsOverview({ loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Analytics Overview</h2>
        <div className="text-sm text-gray-300">Last 30 days</div>
      </div>
      
      {loading ? (
        <div className="h-48 bg-gray-100 animate-pulse rounded"></div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-300 text-sm">Page Views</p>
              <h3 className="text-xl font-bold text-gray-500">12,543</h3>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Unique Visitors</p>
              <h3 className="text-xl font-bold text-gray-500">4,876</h3>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Conversion Rate</p>
              <h3 className="text-xl font-bold text-gray-500">3.2%</h3>
            </div>
          </div>
          
          {/* Placeholder for chart */}
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
            <FaChartLine className="text-gray-300 text-4xl" />
          </div>
        </div>
      )}
    </div>
  )
}
import { FaBuilding, FaLayerGroup, FaDoorOpen } from 'react-icons/fa'

export default function StatsOverview({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaBuilding className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Total Residentials</p>
            {loading ? (
              <div className="h-6 w-16 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-500">{stats.residentials}</h3>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <FaLayerGroup className="text-green-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Total Clusters</p>
            {loading ? (
              <div className="h-6 w-16 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-500">{stats.clusters}</h3>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <FaDoorOpen className="text-purple-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Total Unit Types</p>
            {loading ? (
              <div className="h-6 w-16 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-500">{stats.units}</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
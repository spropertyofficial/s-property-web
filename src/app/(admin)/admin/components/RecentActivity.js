import Link from 'next/link'
import { FaBuilding, FaLayerGroup, FaDoorOpen, FaUsers } from 'react-icons/fa'

export default function RecentActivity({ loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Recent Activity</h2>
        <Link href="#" className="text-blue-600 text-sm hover:underline">View All</Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 animate-pulse rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaBuilding className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500">New residential property added</p>
              <p className="text-xs text-gray-300">Today, 10:30 AM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <FaLayerGroup className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500">Cluster "Adora" updated</p>
              <p className="text-xs text-gray-300">Yesterday, 3:45 PM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <FaDoorOpen className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500">New unit type added to "Belova"</p>
              <p className="text-xs text-gray-300">Yesterday, 1:20 PM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <FaUsers className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-500">New user registered</p>
              <p className="text-xs text-gray-300">2 days ago</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
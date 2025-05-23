import Link from 'next/link'

export default function UpcomingTasks({ loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Upcoming Tasks</h2>
        <Link href="#" className="text-blue-600 text-sm hover:underline">View All</Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded mb-2"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mr-3" />
            <div className="flex-1">
              <p className="text-gray-500">Update property images for Terravia</p>
              <p className="text-xs text-gray-300">Due: Tomorrow</p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mr-3" />
            <div className="flex-1">
              <p className="text-gray-500">Review new cluster proposal</p>
              <p className="text-xs text-gray-300">Due: 3 days</p>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">In Progress</div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mr-3" />
            <div className="flex-1">
              <p className="text-gray-500">Prepare monthly sales report</p>
              <p className="text-xs text-gray-300">Due: Next week</p>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Planned</div>
          </div>
        </div>
      )}
    </div>
  )
}
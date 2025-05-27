import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

export default function RecentListings({ loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Recent Listings</h2>
        <Link href="/admin/residential" className="text-blue-600 text-sm hover:underline">View All</Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-16 w-16 bg-gray-100 animate-pulse rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
              <FaHome className="text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-500">Terravia Residence</p>
              <p className="text-sm text-gray-300">BSD City, Tangerang</p>
              <p className="text-sm text-blue-600">Rp4.4M</p>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">SALE</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
              <FaHome className="text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-500">Adora Cluster</p>
              <p className="text-sm text-gray-300">BSD City, Tangerang</p>
              <p className="text-sm text-blue-600">Rp3.8M</p>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">SALE</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
              <FaHome className="text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-500">Belova Type A</p>
              <p className="text-sm text-gray-300">BSD City, Tangerang</p>
              <p className="text-sm text-blue-600">Rp5.2M</p>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">RENT</div>
          </div>
        </div>
      )}
    </div>
  )
}
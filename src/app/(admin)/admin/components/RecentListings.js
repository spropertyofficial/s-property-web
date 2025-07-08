import Link from 'next/link';
import { FaHome, FaMapMarkerAlt, FaExternalLinkAlt, FaEdit } from 'react-icons/fa';

export default function RecentListings({ loading }) {
  const listings = [
    {
      id: 1,
      name: "Terravia Residence",
      location: "BSD City, Tangerang",
      price: "Rp 4.4M",
      status: "SALE",
      type: "Perumahan",
      addedDate: "2 days ago"
    },
    {
      id: 2, 
      name: "Adora Cluster",
      location: "BSD City, Tangerang", 
      price: "Rp 3.8M",
      status: "SALE",
      type: "Cluster",
      addedDate: "3 days ago"
    },
    {
      id: 3,
      name: "Belova Residence",
      location: "Gading Serpong, Tangerang",
      price: "Rp 2.9M",
      status: "RENT",
      type: "Perumahan", 
      addedDate: "1 week ago"
    }
  ];

  const getStatusStyle = (status) => {
    return status === 'SALE' 
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-blue-50 text-blue-700 border border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
          <p className="text-sm text-gray-600">Latest property additions</p>
        </div>
        <Link 
          href="/admin/residential" 
          className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 font-medium"
        >
          View All <FaExternalLinkAlt className="text-xs" />
        </Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="h-16 w-16 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <FaHome className="text-gray-400 text-lg" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{listing.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {listing.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <FaMapMarkerAlt className="text-xs" />
                  <span className="truncate">{listing.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-600">{listing.price}</p>
                  <p className="text-xs text-gray-500">{listing.addedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(listing.status)}`}>
                  {listing.status}
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaEdit className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
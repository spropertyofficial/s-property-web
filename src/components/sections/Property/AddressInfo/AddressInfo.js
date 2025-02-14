import { Familjen_Grotesk } from 'next/font/google';
import React from 'react';
import { FaMapMarkerAlt, FaMap  } from 'react-icons/fa';

const addressData = {
  address: 'Jalan Tukad Banyu Poh',
  city: 'BSD City',
  province: 'Banten',
  area: 'Pagedangan',
  country: 'Indonesia',
  mapsLink: 'https://goo.gl/maps/example'
};

const AddressInfo = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Address</h2>
        </div>
        <a 
          href={addressData.mapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-green-600 hover:text-green-700 transition-colors"
        >
          <FaMap className="mr-1" />
          <span className="text-sm font-medium">Open on Google Maps</span>
        </a>
      </div>

      <div className="space-y-2">
        <AddressRow label="Address" value={addressData.address} />
        <AddressRow label="City" value={addressData.city} />
        <AddressRow label="Province" value={addressData.province} />
        <AddressRow label="Area" value={addressData.area} />
        <AddressRow label="Country" value={addressData.country} />
      </div>
    </div>
  );
};

const AddressRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-800 font-semibold">{value}</span>
  </div>
);

export default AddressInfo;
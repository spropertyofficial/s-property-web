import { Familjen_Grotesk } from "next/font/google";
import React from "react";
import { FaMapMarkerAlt, FaMap } from "react-icons/fa";

const AddressInfo = ({
  region,
  city,
  area,
  address,
  country,
  mapsLink,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Address</h2>
        </div>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-green-600 hover:text-green-700 transition-colors"
        >
          <FaMap className="mr-1" />
          <span className="text-sm font-medium">Open on Google Maps</span>
        </a>
      </div>

      <div className="space-y-2">
        <AddressRow label="Address" value={address}/>
        <AddressRow label="City" value={city} />
        <AddressRow label="Province" value={region} />
        <AddressRow label="Area" value={area} />
        <AddressRow label="Country" value={country} />
      </div>
    </div>
  );
};

const AddressRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 font-medium me-8">{label}</span>
    <span className="text-gray-800 font-semibold text-base">{value}</span>
  </div>
);

export default AddressInfo;
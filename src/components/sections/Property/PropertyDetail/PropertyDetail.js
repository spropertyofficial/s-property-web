/* Property Basic Info */
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaHome,
  FaPlug,
} from "react-icons/fa";
import { SlSizeFullscreen } from "react-icons/sl";

export default function PropertyDetail({ specs }) {
  return (
    <div className="my-2 bg-white rounded-lg shadow-md p-4 border-gray-400">
      <h2 className="text-xl font-semibold mb-3 text-green-500 mt-2">
        Detail Properti
      </h2>
      <div className="bg-white p-4">
        <PropertyDetailRow
          icon={<FaHome className="text-blue-500 text-2xl" />}
          label="Tipe Properti"
          value={`${specs.type}`}
        />
      </div>
      <div className="bg-white p-4 ">
        <PropertyDetailRow
          icon={<FaBed className="text-blue-500 text-2xl" />}
          label="Kamar Tidur"
          value={`${specs.beds}`}
        />
      </div>
      <div className="bg-white p-4 ">
        <PropertyDetailRow
          icon={<FaBath className="text-blue-500 text-2xl" />}
          label="Kamar Mandi"
          value={`${specs.baths}`}
        />
      </div>
      <div className="bg-white p-4 ">
        <PropertyDetailRow
          icon={<FaRulerCombined className="text-green-500 text-2xl" />}
          label="Luas Tanah"
          value={`${specs.landSize} m²`}
        />
      </div>
      <div className="bg-white p-4 ">
        <PropertyDetailRow
          icon={<SlSizeFullscreen className="text-green-500 text-2xl" />}
          label="Luas Bangunan"
          value={`${specs.buildingSize} m²`}
        />
      </div>
      <div className="bg-white p-4 ">
        <PropertyDetailRow
          icon={<FaPlug className="text-green-500 text-2xl" />}
          label="Listrik"
          value={`${specs.electricity} Watt`}
        />
      </div>
    </div>
  );
}

function PropertyDetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-3">{icon}</div>
        <span className="text-gray-600">{label}</span>
      </div>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
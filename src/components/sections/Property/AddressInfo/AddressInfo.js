// src/components/sections/Property/AddressInfo/AddressInfo.js
const AddressInfo = ({ address, city, area, country }) => {
    return (
      <div className="mb-6">
        <p className="text-sm">{address}</p>
        <p className="text-sm">{city}</p>
        <p className="text-sm">{area}</p>
        <p className="text-sm">{country}</p>
      </div>
    );
  };
  
  export default AddressInfo;
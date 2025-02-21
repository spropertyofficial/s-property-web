
import PropertyCard from "@/components/common/PropertyCard";
import { residentials } from "@/data/residentials";
import Propertylist from "@/components/common/PropertyListing";

export default function PropertyListing() {
  return (
    <div className="px-6 py-6 bg-gray-50">
      <Propertylist data={residentials} type="residentials" title="Residential" />
    </div>
  );
}

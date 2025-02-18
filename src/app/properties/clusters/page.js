"use client";

import { use } from "react";
import AddressInfo from "@/components/sections/Property/AddressInfo";
import Gallery from "@/components/sections/Property/Gallery";
import Header from "@/components/sections/Property/Header";
import PropertyDetail from "@/components/sections/Property/PropertyDetail";
import { useGetPropertyByIdQuery } from "@/store/api/residentialsApi";

const PropertyDetailPage = ({ params }) => {
  const resolvedParams = use(params);
  const {
    data: property,
    isLoading,
    error,
  } = useGetPropertyByIdQuery(resolvedParams.id);
console.log(property);
  if (isLoading) {
    return <div className="container mx-auto px-4 py-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">Error loading property</div>
    );
  }

  if (!property || !property.gallery) {
    return (
      <div className="container mx-auto px-4 py-6">Property not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Gallery images={property.gallery} />
      <Header {...property} />
      <AddressInfo {...property} />
      <PropertyDetail {...property} />
    </div>
  );
};

export default PropertyDetailPage;

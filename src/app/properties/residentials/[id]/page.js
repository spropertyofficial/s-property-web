// src\app\properties\residentials\[id]\page.js
"use client";

import { use } from "react";
import AddressInfo from "@/components/sections/Property/AddressInfo";
import Gallery from "@/components/sections/Property/Gallery";
import Header from "@/components/sections/Property/Header";
import { useGetResidentialByIdQuery } from "@/store/api/residentialsApi";
import WhatsAppButton from "@/components/common/WhatsappButton";

const PropertyDetailPage = ({ params }) => {
  const { id } = use(params);
  const { data: property, isLoading, error } = useGetResidentialByIdQuery(id);

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
    <>
      <div className="container mx-auto px-4 py-6">
        <Gallery images={property.gallery} />
        <Header
          title={property.name}
          {...property}
          price={property.startPrice}
          type={"Residential"}
        />
        <AddressInfo {...property.location} />
      </div>
      <WhatsAppButton propertyData={property} />
    </>
  );
};

export default PropertyDetailPage;

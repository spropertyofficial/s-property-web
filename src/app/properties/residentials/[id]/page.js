// src\app\properties\residentials\[id]\page.js
"use client";

import { use } from "react";
import AddressInfo from "@/components/sections/Property/AddressInfo";
import Gallery from "@/components/sections/Property/Gallery";
import Header from "@/components/sections/Property/Header";
import PropertyListing from "@/components/common/PropertyListing/PropertyListing";
import { clustersData } from "@/data/clusters";
import { useGetResidentialByIdQuery } from "@/store/api/residentialsApi";

const PropertyDetailPage = ({ params }) => {
    const {id} = use(params);
    const {
      data: property,
      isLoading,
      error,
    } = useGetResidentialByIdQuery(id);

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
      <Gallery images={property.gallery}/>
      <Header title={property.name} {...property} price={"14 Miliar"} type={"Residential"}/>
      <AddressInfo {...property.location} />
    </div>
  );
};

export default PropertyDetailPage;

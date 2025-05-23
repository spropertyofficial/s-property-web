// src/app/page.js
"use client";
import CategoryMenu from "@/components/sections/Home/CategoryMenu";
import ExploreCities from "@/components/sections/Home/ExploreCities";
import SearchSection from "@/components/sections/Home/SearchSection";
import PropertyListing from "@/components/common/PropertyListing";
import { useGetResidentialsQuery } from "@/store/api/residentialsApi";

export default function Home() {
  const { data: properties, isLoading, error } = useGetResidentialsQuery();
  const masterLeadProjects = properties?.filter(
    (property) =>
      property.name === "Griya Harmoni Cibugel" ||
      property.name === "Taman Cisoka Indah"
  );
  const subLeadProjects = properties?.filter(
    (property) =>
      property.name == "Grand Tenjo Residence" ||
      property.name !== "Cikupa Green Village"
  );
  return (
    <main>
      <div>
        <SearchSection />
      </div>
      <div className="lg:px-20">
        <CategoryMenu />
        <ExploreCities />
        <PropertyListing
          data={masterLeadProjects}
          type="residentials"
          title="Master Lead Project"
          isLoading={isLoading}
        />
        <PropertyListing
          data={subLeadProjects}
          type="residentials"
          title="Sub Lead Project"
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}

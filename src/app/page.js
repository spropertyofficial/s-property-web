// src/app/page.js
"use client";
import CategoryMenu from "@/components/sections/Home/CategoryMenu";
import ExploreCities from "@/components/sections/Home/ExploreCities";
import SearchSection from "@/components/sections/Home/SearchSection";
import PropertyListing from "@/components/common/PropertyListing";
import { useGetResidentialsQuery } from "@/store/api/residentialsApi";

export default function Home() {
  const { data: properties, isLoading, error } = useGetResidentialsQuery();
  return (
    <main>
      <div>
        <SearchSection />
      </div>
      <div className="px-20">
        <CategoryMenu />
        <ExploreCities />
        <PropertyListing
          data={properties}
          type="residentials"
          title="Property Pilihan"
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}

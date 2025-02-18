"use client";
import CategoryMenu from "@/components/sections/Home/CategoryMenu";
import ExploreCities from "@/components/sections/Home/ExploreCities";
import PropertyCard from "@/components/sections/Home/PropertyListing/components/PropertyCard";
import SearchSection from "@/components/sections/Home/SearchSection";
import { useSelector } from "react-redux";

export default function Home() {
  const data = useSelector((state) => state.residentials.residentials);
  console.log(data);
  return (
    <main>
      <SearchSection />
      <CategoryMenu />
      <ExploreCities />
      <div className="container mx-auto pb-5 bg-gray-50">
        <h3 className="text-2xl font-bold p-4">Property Pilihan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          {data.map((residential) => (
            <PropertyCard
              type="residentials"
              key={residential.id}
              data={residential}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// src/app/page.js
"use client";
import CategoryMenu from "@/components/sections/Home/CategoryMenu";
import ExploreCities from "@/components/sections/Home/ExploreCities";
import SearchSection from "@/components/sections/Home/SearchSection";
import { useSelector } from "react-redux";
import PropertyListing from "@/components/common/PropertyListing";
import { residentialsData } from "@/data/residentials";
import { useGetResidentialsQuery } from "@/store/api/residentialsApi";



export default function Home() {
  const data = useSelector((state) => state.residentials.residentials);
  const {data: properties} = useGetResidentialsQuery();
  console.log(properties);
  return (
    <main>
      <SearchSection />
      <CategoryMenu />
      <ExploreCities />
      <PropertyListing data={residentialsData} type="residentials" title="Property Pilihan"/>
    </main>
  );
}

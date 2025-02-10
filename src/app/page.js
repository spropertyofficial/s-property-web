import CategoryMenu from "@/components/sections/Home/CategoryMenu";
import ExploreCities from "@/components/sections/Home/ExploreCities";
import PropertyListing from "@/components/sections/Home/PropertyListing";
import SearchSection from "@/components/sections/Home/SearchSection";

export default function Home() {
  return (
    <main>
      <SearchSection/>
      <CategoryMenu/>
      <ExploreCities/>
      <PropertyListing/>
    </main>
  )
}
import SearchBar from "./components/SearchBar";
import TabNav from "./components/TabNav";

export default function SearchSection() {
  return (
      <div className="relative">
        <div className="absolute inset-0 bg-tosca-200"></div>
        <div className="relative px-6 pb-8 pt-6">
          <h1 className="text-white text-xl font-medium mb-4">
            Jual Beli Sewa KPR Properti
          </h1>
          
          <TabNav />
          <SearchBar />
        </div>
      </div>
  )
}
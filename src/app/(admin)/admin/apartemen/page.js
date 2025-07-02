"use client";
import PropertyListPage from "../components/PropertyListPage";

export default function AdminApartemenPage() {
  return (
    <PropertyListPage
      assetType="Apartemen"
      title="Daftar Properti Apartemen"
      addUrl="/admin/properties/add"
      editUrl="/admin/properties/edit"
      detailUrl="/admin/properties"
      apiEndpoint="/api/properties"
    />
  );
}

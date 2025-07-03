"use client";
import PropertyListPage from "../components/PropertyListPage";

export default function AdminApartemenPage() {
  return (
    <PropertyListPage
      assetType="Apartemen"
      title="Daftar Properti Apartemen"
      detailUrl="/admin/apartemen"
    />
  );
}

"use client";
import PropertyListPage from "../components/PropertyListPage";

export default function AdminTanahPage() {
  return (
    <PropertyListPage
      assetType="Tanah"
      title="Daftar Properti Tanah"
      detailUrl="/admin/tanah"
    />
  );
}

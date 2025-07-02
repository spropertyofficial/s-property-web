"use client";
import { useParams } from "next/navigation";
import PropertyFormPage from "../../../components/PropertyFormPage";

export default function EditPropertyPage() {
  const params = useParams();
  const { id } = params;

  return <PropertyFormPage propertyId={id} />;
}

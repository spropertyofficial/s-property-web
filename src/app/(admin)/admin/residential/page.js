// filepath: src/app/(admin)/admin/residential/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import PropertyListPage from "../../../components/admin/PropertyListPage";
import { PROPERTY_TYPES } from "../../../lib/constants/propertyTypes";

export default function ResidentialPage() {
  const propertyType = PROPERTY_TYPES.RESIDENTIAL;

  return (
    <PropertyListPage propertyType={propertyType} />
  );
}
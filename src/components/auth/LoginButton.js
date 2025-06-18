"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginButton({ className = "" }) {
  const { loading } = useAuth();

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>;
  }

  return (
    <Link
      href="/login"
      className={`bg-tosca-400 text-white px-4 py-2 rounded-md hover:bg-tosca-500 transition-colors ${className}`}
    >
      Login
    </Link>
  );
}

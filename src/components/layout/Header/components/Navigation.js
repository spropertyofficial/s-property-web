"use client";
import AuthButton from "@/components/auth/AuthButton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
<<<<<<< HEAD

=======
>>>>>>> 3e85ff7f41efb6baf0f4293450d393d287c356d1
const menuItems = [
  { label: "Home", href: "/" },
  { label: "Properti", href: "/properties/residentials" },
  { label: "Join S-Pro", href: "/join-s-pro" },
  { label: "Simulasi KPR", href: "/simulasi-kpr" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
];

export default function Navigation() {
  const { loading } = useAuth();

  // Show loading state for entire nav
  if (loading) {
    return (
      <nav className="flex items-center gap-8">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative text-tosca-300 hover:text-tosca-100 font-medium transition-colors duration-200
              after:content-[''] after:absolute after:w-full after:h-0.5 
              after:bg-tosca-100 after:left-0 after:-bottom-1 
              after:scale-x-0 hover:after:scale-x-100 
              after:transition-transform after:duration-300 after:origin-left"
          >
            {item.label}
          </Link>
        ))}
        <div className="px-3 py-2">
          <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-8">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative text-white hover:text-white font-medium transition-colors duration-200
            after:content-[''] after:absolute after:w-full after:h-0.5 
            after:bg-white after:left-0 after:-bottom-1 
            after:scale-x-0 hover:after:scale-x-100 
            after:transition-transform after:duration-300 after:origin-left"
        >
          {item.label}
        </Link>
      ))}

      <AuthButton variant="default" showUserInfo={true} className="px-3 py-2" />
    </nav>
  );
}

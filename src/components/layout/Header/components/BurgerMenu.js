"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import LoginButton from "@/components/auth/LoginButton";
import AuthButton from "@/components/auth/AuthButton";

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Properti", href: "/properties/residentials" },
    { label: "Join S-Pro", href: "/join-s-pro" },
    { label: "Simulasi KPR", href: "/simulasi-kpr" },
    { label: "Tentang Kami", href: "/about" },
    { label: "Kontak", href: "/contact" },
  ];

  // Close menu when clicking on menu items
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {/* Burger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-20 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Content */}
      <div
        className={`
        fixed top-20 left-0 h-[calc(100vh-5rem)] w-[280px] bg-tosca-100 z-50 transform transition-transform duration-600
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="px-8 py-4 h-full">
          {/* Menu Items */}
          <nav className="space-y-4 text-left h-full flex flex-col">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block text-white hover:text-white/50 transition-colors"
                onClick={handleMenuItemClick}
              >
                {item.label}
              </Link>
            ))}

            {/* Auth Section - Push to bottom */}
            <AuthButton
              variant="mobile"
              showUserInfo={true}
              className="px-3 py-2"
            />
          </nav>
        </div>
      </div>
    </div>
  );
}

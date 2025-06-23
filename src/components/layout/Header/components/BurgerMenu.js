"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Properti", href: "/properties/residentials" },
    { label: "Join S-Pro", href: "/join-s-pro" },
    { label: "Simulasi KPR", href: "/simulasi-kpr" },
    { label: "Tentang Kami", href: "/about" },
    { label: "Kontak", href: "/contact" },
  ];

  useEffect(() => {
    if (user) {
      console.log("BurgerMenu - User is logged in:", user);
    } else {
      console.log("BurgerMenu - User is not logged in");
    }
  }, [user]);

  // Close menu when clicking on menu items
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const handleLogoutComplete = () => {
    handleMenuItemClick(); // Close menu after logout
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

            {/* Auth Section */}
            <div className="pt-4 border-t border-white/20">
              {loading ? (
                <div className="px-3 py-2">
                  <div className="animate-pulse bg-white/20 h-8 w-full rounded"></div>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="px-3 py-2 bg-white/10 rounded-md">
                    <div className="text-white text-sm font-medium">
                      {user.name}
                    </div>
                    {user.agentCode && (
                      <div className="text-white/70 text-xs">
                        Agent: {user.agentCode}
                      </div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <AuthButton
                    variant="mobile"
                    showUserInfo={false}
                    onLogoutComplete={handleLogoutComplete}
                  />
                </div>
              ) : (
                <div className="px-3 py-2">
                  <AuthButton variant="mobile" />
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

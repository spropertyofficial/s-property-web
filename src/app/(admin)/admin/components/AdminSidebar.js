"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaBuilding,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown, // Ikon untuk submenu
  FaTags, // Ikon baru untuk Kategori
  FaUsersCog, // Ikon baru untuk Manajemen Admin
} from "react-icons/fa";
import { useState } from "react";

export default function AdminSidebar({ handleLogout }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // State untuk melacak submenu mana yang sedang terbuka
  const [openSubMenus, setOpenSubMenus] = useState({});

  // Fungsi untuk toggle submenu
  const toggleSubMenu = (name) => {
    setOpenSubMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Struktur navigasi baru dengan dukungan submenu
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaTachometerAlt />,
    },
    {
      // Menu baru yang bisa diciutkan
      name: "Properti",
      icon: <FaBuilding />,
      subItems: [
        { name: "Perumahan", path: "/admin/perumahan" }, // Ganti dari /residential
        { name: "Ruko", path: "/admin/ruko" },
        { name: "Apartemen", path: "/admin/apartemen" },
        { name: "Tanah", path: "/admin/tanah" },
        { name: "Kavling", path: "/admin/kavling" },
      ],
    },
    {
      name: "Manajemen Kategori",
      icon: <FaTags />,
      subItems: [
        { name: "Tipe Aset", path: "/admin/manage-categories/asset-types" },
        {
          name: "Status Pasar",
          path: "/admin/manage-categories/market-status",
        },
        {
          name: "Status Ketersediaan",
          path: "/admin/manage-categories/listing-status",
        },
      ],
    },
    {
      name: "Manajemen Admin",
      path: "/admin/manage-users",
      icon: <FaUsersCog />,
    },
  ];

  return (
    <div
      className={`bg-white shadow-md fixed h-full z-20 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between h-16">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-gray-700">S-Property</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul>
            {navItems.map((item) => {
              const isActive = item.path && pathname.startsWith(item.path);
              const isSubMenuActive =
                item.subItems &&
                item.subItems.some((sub) => pathname.startsWith(sub.path));

              return (
                <li key={item.name} className="px-4 mb-1">
                  {item.subItems ? (
                    // Jika item punya submenu, buat jadi tombol collapsible
                    <div>
                      <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full flex items-center justify-between py-2.5 px-4 rounded-md transition-colors ${
                          isSubMenuActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{item.icon}</span>
                          {sidebarOpen && <span>{item.name}</span>}
                        </div>
                        {sidebarOpen && (
                          <FaChevronDown
                            className={`transition-transform duration-200 ${
                              openSubMenus[item.name] ? "rotate-180" : ""
                            }`}
                            size={12}
                          />
                        )}
                      </button>
                      {/* Tampilkan submenu jika terbuka */}
                      {openSubMenus[item.name] && sidebarOpen && (
                        <ul className="mt-2 pl-8 border-l-2 border-gray-200">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                href={subItem.path}
                                className={`block py-2 text-sm ${
                                  pathname === subItem.path
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-500 hover:text-gray-800"
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Jika tidak punya submenu, render sebagai Link biasa
                    <Link
                      href={item.path}
                      className={`flex items-center py-2.5 px-4 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2 px-4 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          {sidebarOpen ? (
            <div className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} S-Property
            </div>
          ) : (
            <div className="text-center text-gray-300">&copy;</div>
          )}
        </div>
      </div>
    </div>
  );
}

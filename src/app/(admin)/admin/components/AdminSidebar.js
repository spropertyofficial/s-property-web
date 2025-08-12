"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaBuilding,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaTags,
  FaUsersCog,
  FaChartBar,
  FaCog,
  FaGlobe,
  FaUserPlus,
  FaIndustry,
} from "react-icons/fa";
import { useState } from "react";

export default function AdminSidebar({ isOpen, onToggle, onLogout }) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (name) => {
    setOpenSubMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <FaChartBar />,
      subItems: [
        { name: "Production", path: "/admin/kpi/production" },
        { name: "Performance", path: "/admin/kpi/performance" },
      ],
    },
    {
      name: "Aktivitas & Skor",
      path: "/admin/kpi/activity-types",
      icon: <FaCog />,
    },
    {
      name: "Laporan Penjualan",
      path: "/admin/sales-records",
      icon: <FaChartBar />,
    },

    {
      name: "Log Activity",
      path: "/admin/log-activity",
      icon: <FaIndustry />,
    },
    {
      name: "Registrasi",
      path: "/admin/registrations",
      icon: <FaUserPlus />,
    },
    {
      name: "Properti",
      icon: <FaBuilding />,
      subItems: [
        { name: "Perumahan", path: "/admin/perumahan" },
        { name: "Ruko", path: "/admin/ruko" },
        { name: "KPI Config", path: "/admin/kpi/config" },
        { name: "Apartemen", path: "/admin/apartemen" },
        { name: "Tanah", path: "/admin/tanah" },
        { name: "Kavling", path: "/admin/kavling" },
      ],
    },
    {
      name: "Kategori",
      icon: <FaTags />,
      subItems: [
        { name: "Tipe Aset", path: "/admin/manage-categories/asset-types" },
        {
          name: "Status Pasar",
          path: "/admin/manage-categories/market-status",
        },
        {
          name: "Status Listing",
          path: "/admin/manage-categories/listing-status",
        },
      ],
    },
    {
      name: "Explore Cities",
      path: "/admin/region-city-images",
      icon: <FaGlobe />,
    },
    {
      name: "Manajemen Admin",
      path: "/admin/manage-users",
      icon: <FaUsersCog />,
    },
    {
      name: "Pengaturan",
      path: "/admin/settings",
      icon: <FaCog />,
    },
  ];

  return (
    <div
      className={`bg-white shadow-lg fixed h-full z-20 transition-all duration-300 border-r border-gray-200 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">S-Property</h2>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {isOpen ? (
              <FaTimes className="text-sm" />
            ) : (
              <FaBars className="text-sm" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = item.path && pathname === item.path;
              const isSubMenuActive =
                item.subItems &&
                item.subItems.some((sub) => pathname.startsWith(sub.path));

              return (
                <li key={item.name}>
                  {item.subItems ? (
                    <div>
                      <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full flex items-center justify-between py-3 px-3 rounded-lg transition-all ${
                          isSubMenuActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{item.icon}</span>
                          {isOpen && (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </div>
                        {isOpen && (
                          <FaChevronDown
                            className={`transition-transform duration-200 text-xs ${
                              openSubMenus[item.name] ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {openSubMenus[item.name] && isOpen && (
                        <ul className="mt-2 ml-6 space-y-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                href={subItem.path}
                                className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                                  pathname === subItem.path
                                    ? "text-blue-700 bg-blue-50 font-medium"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                    <Link
                      href={item.path}
                      className={`flex items-center py-3 px-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {isOpen && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center w-full py-3 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="p-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              &copy; {new Date().getFullYear()} S-Property Admin
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaBuilding,
  FaLayerGroup,
  FaDoorOpen,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";

export default function AdminSidebar({ handleLogout }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Residentials",
      path: "/admin/residential",
      icon: <FaBuilding />,
    },
    {
      name: "Clusters",
      path: "/admin/clusters",
      icon: <FaLayerGroup />,
    },
    {
      name: "Unit Types",
      path: "/admin/types",
      icon: <FaDoorOpen />,
    },
  ];

  return (
    <div
      className={`bg-white shadow-md fixed h-full z-10 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-gray-500">S-Property</h2>
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
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center py-3 px-4 ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
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

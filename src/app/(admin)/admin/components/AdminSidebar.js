'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaBuilding, FaLayerGroup, FaDoorOpen, FaTachometerAlt,
  FaBars, FaTimes, FaSignOutAlt,
  FaPeopleCarry
} from 'react-icons/fa'

export default function AdminSidebar({ handleLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  // Sidebar navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: <FaTachometerAlt /> 
    },
    { 
      name: 'Residentials', 
      path: '/admin/residential', 
      icon: <FaBuilding /> 
    },
    { 
      name: 'Clusters', 
      path: '/admin/clusters', 
      icon: <FaLayerGroup /> 
    },
    { 
      name: 'Unit Types', 
      path: '/admin/types', 
      icon: <FaDoorOpen /> 
    },
    { 
      name: 'Manage User', 
      path: '/admin/manage-users', 
      icon: <FaPeopleCarry /> 
    }
  ]

  return (
    <div className={`bg-white shadow-md fixed h-full z-10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold text-gray-500">S-Property</h2>}
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
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          {sidebarOpen ? (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-300">
                &copy; {new Date().getFullYear()} S-Property
              </div>
              <button 
                onClick={handleLogout}
                className="text-red-500 text-sm hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button 
                onClick={handleLogout}
                className="text-red-500 text-lg"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
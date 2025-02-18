// src/components/layout/Header/components/BurgerMenu.js
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Properti', href: '/properties' },
    { label: 'Join S-Pro', href: '/join' },
    { label: 'Simulasi KPR', href: '/simulasi-kpr' },
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Kontak', href: '/contact' },
  ]

  return (
    <div>
      {/* Burger Icon - Menggunakan div bukan button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="text-tosca-200 hover:text-tosca-300 transition-colors cursor-pointer"
      >
        {isOpen ? <X size={30} /> : <Menu size={30} />}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Menu Content */}
      <div className={`
        fixed top-0 left-0 h-full w-[280px] bg-white z-50 
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          {/* Logo */}
          <div className="mb-8">
            <img src="/images/logo.png" alt="S-Property" className="h-8" />
          </div>

          {/* Menu Items */}
          <nav className="space-y-4">
            {menuItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                className="block text-gray-600 hover:text-tosca-200 py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
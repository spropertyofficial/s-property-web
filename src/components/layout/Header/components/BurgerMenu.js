"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

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
      {/* Burger Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-tosca-200 hover:text-tosca-300 transition-colors"
      >
        {isOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-20 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Menu Content */}
      <div className={`
        fixed top-20 left-0 h-full w-[280px] bg-tosca-100 z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="p-4">

          {/* Menu Items */}
          <nav className="space-y-3 text-left">
            {menuItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                className="block text-white hover:text-white/50 py-2 transition-colors"
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
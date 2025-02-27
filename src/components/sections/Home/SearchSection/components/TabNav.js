'use client'

import { useState } from 'react'
export default function TabNav() {
    const [activeTab, setActiveTab] = useState('Dijual')

    return (
      <div className="flex gap-6 mb-4 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('Dijual')}
          className={`${activeTab === 'Dijual' ? 'text-white border-b-2 border-white' : 'text-white/80 hover:text-white'} pb-1 whitespace-nowrap font-medium transition-colors`}
        >
          Dijual
        </button>
        <button 
          onClick={() => setActiveTab('Disewa')}
          className={`${activeTab === 'Disewa' ? 'text-white border-b-2 border-white' : 'text-white/80 hover:text-white'} pb-1 whitespace-nowrap font-medium transition-colors`}
        >
          Disewa
        </button>
        <button 
          onClick={() => setActiveTab('Proyek Baru')}
          className={`${activeTab === 'Proyek Baru' ? 'text-white border-b-2 border-white' : 'text-white/80 hover:text-white'} pb-1 whitespace-nowrap font-medium transition-colors`}
        >
          Proyek Baru
        </button>
      </div>
    )
  }
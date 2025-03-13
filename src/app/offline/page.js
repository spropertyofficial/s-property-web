'use client'

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Anda sedang offline</h1>
      <p>Silakan periksa koneksi internet Anda dan coba lagi.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Coba lagi
      </button>
    </div>
  )
}
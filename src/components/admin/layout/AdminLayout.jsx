'use client'

import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import AdminSidebar from '@/app/(admin)/admin/components/AdminSidebar'

export default function AdminLayout({ children }) {
  const router = useRouter()

  const handleLogout = () => {
    // Hapus token atau status login
    localStorage.removeItem('adminLoggedIn')
    document.cookie = 'adminLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    Swal.fire({
      title: 'Berhasil Logout',
      text: 'Anda telah keluar dari sistem',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      // Redirect ke halaman utama
      router.push('/')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar handleLogout={handleLogout} />
      <div className="flex-1 ml-64 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
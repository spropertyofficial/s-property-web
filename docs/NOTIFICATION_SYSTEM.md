# Sistem Notifikasi S-Property

## Overview
Sistem notifikasi modern dan responsif untuk aplikasi S-Property yang memungkinkan menampilkan pesan kepada pengguna dengan animasi smooth dan pengalaman yang user-friendly.

## Fitur
- ✅ 4 tipe notifikasi: Success, Error, Warning, Info
- ✅ Animasi slide-in dan slide-out yang smooth
- ✅ Auto-close dengan durasi yang dapat disesuaikan
- ✅ Responsive design untuk desktop dan mobile
- ✅ Global access melalui window object atau custom hook
- ✅ TypeScript friendly
- ✅ Lightweight dan performant

## Komponen

### 1. NotificationSystem.js
Komponen utama yang menangani rendering dan animasi notifikasi.

**Lokasi:** `src/components/ui/NotificationSystem.js`

### 2. useNotification Hook
Custom hook untuk memudahkan penggunaan sistem notifikasi.

**Lokasi:** `src/hooks/useNotification.js`

## Instalasi dan Setup

### 1. Integrasi ke Layout
Sistem notifikasi sudah terintegrasi di `src/app/layout.js`:

```javascript
import NotificationSystem from "@/components/ui/NotificationSystem";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
        <NotificationSystem />
      </body>
    </html>
  );
}
```

### 2. Dependencies
Sistem notifikasi menggunakan:
- React Icons (FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes)
- Tailwind CSS untuk styling
- Next.js untuk styled-jsx

## Cara Penggunaan

### Method 1: Menggunakan useNotification Hook (Recommended)

```javascript
import useNotification from "@/hooks/useNotification";

function MyComponent() {
  const notify = useNotification();

  const handleSuccess = () => {
    notify.success("Data berhasil disimpan!");
  };

  const handleError = () => {
    notify.error("Terjadi kesalahan saat menyimpan data!");
  };

  const handleWarning = () => {
    notify.warning("Periksa kembali data yang Anda masukkan!");
  };

  const handleInfo = () => {
    notify.info("Fitur ini dalam tahap pengembangan.");
  };

  // Custom duration (default: 5000ms)
  const handleCustom = () => {
    notify.success("Pesan ini akan hilang dalam 3 detik", 3000);
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Method 2: Menggunakan Global Function

```javascript
// Dapat dipanggil dari mana saja setelah komponen dimount
if (typeof window !== 'undefined' && window.showNotification) {
  window.showNotification("Pesan berhasil!", "success");
  window.showNotification("Terjadi kesalahan!", "error", 3000);
}
```

## API Reference

### useNotification Hook

| Method | Parameter | Type | Default | Description |
|--------|-----------|------|---------|-------------|
| `success()` | message, duration | string, number | 5000ms | Menampilkan notifikasi sukses |
| `error()` | message, duration | string, number | 5000ms | Menampilkan notifikasi error |
| `warning()` | message, duration | string, number | 5000ms | Menampilkan notifikasi peringatan |
| `info()` | message, duration | string, number | 5000ms | Menampilkan notifikasi info |
| `show()` | message, type, duration | string, string, number | "info", 5000ms | Method universal |

### Global Function

```javascript
window.showNotification(message, type, duration)
```

| Parameter | Type | Options | Default | Description |
|-----------|------|---------|---------|-------------|
| message | string | - | - | Pesan yang akan ditampilkan |
| type | string | "success", "error", "warning", "info" | "info" | Tipe notifikasi |
| duration | number | - | 5000 | Durasi tampil dalam ms (0 = permanent) |

## Styling dan Kustomisasi

### Warna dan Gaya
Sistem menggunakan Tailwind CSS classes yang dapat dikustomisasi:

```javascript
// Success: bg-green-50 border-green-200 text-green-800
// Warning: bg-yellow-50 border-yellow-200 text-yellow-800  
// Error: bg-red-50 border-red-200 text-red-800
// Info: bg-blue-50 border-blue-200 text-blue-800
```

### Posisi
Default: Fixed position di top-right
Dapat diubah di `src/components/ui/NotificationSystem.js`:

```javascript
// Ubah class ini untuk mengubah posisi
<div className="fixed top-4 right-4 z-50 space-y-2">
```

### Animasi
- Slide-in dari kanan: `slideIn 0.3s ease-out`
- Slide-out ke kanan: `slideOut 0.3s ease-in`

## Contoh Implementasi

### 1. Form Submit
```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      notify.success("Data berhasil disimpan!");
    } else {
      notify.error("Gagal menyimpan data. Silakan coba lagi.");
    }
  } catch (error) {
    notify.error("Terjadi kesalahan pada jaringan.");
  }
};
```

### 2. Delete Confirmation
```javascript
const handleDelete = async (id) => {
  // Gunakan SweetAlert untuk konfirmasi
  const result = await Swal.fire({
    title: "Konfirmasi Hapus",
    text: "Apakah Anda yakin ingin menghapus item ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal"
  });

  if (result.isConfirmed) {
    try {
      await fetch(\`/api/items/\${id}\`, { method: 'DELETE' });
      notify.success("Item berhasil dihapus!");
    } catch (error) {
      notify.error("Gagal menghapus item!");
    }
  }
};
```

### 3. Bulk Actions
```javascript
const handleBulkDelete = async (selectedIds) => {
  try {
    await Promise.all(
      selectedIds.map(id => fetch(\`/api/items/\${id}\`, { method: 'DELETE' }))
    );
    notify.success(\`\${selectedIds.length} item berhasil dihapus!\`);
  } catch (error) {
    notify.error("Beberapa item gagal dihapus!");
  }
};
```

## Tips Penggunaan

### 1. Durasi yang Tepat
- **Success**: 3-5 detik
- **Info**: 5-7 detik  
- **Warning**: 7-10 detik
- **Error**: 10 detik atau permanent (duration: 0)

### 2. Pesan yang Efektif
- Gunakan bahasa yang jelas dan spesifik
- Hindari teks terlalu panjang
- Sertakan aksi yang bisa dilakukan user jika memungkinkan

### 3. Kombinasi dengan SweetAlert
- Gunakan SweetAlert untuk konfirmasi (delete, submit)
- Gunakan NotificationSystem untuk feedback hasil aksi

## Troubleshooting

### Problem: Notifikasi tidak muncul
**Solusi:**
1. Pastikan `NotificationSystem` sudah di-import di layout
2. Cek console untuk error JavaScript
3. Pastikan komponen sudah ter-mount sebelum memanggil notifikasi

### Problem: Hook tidak berfungsi
**Solusi:**
1. Pastikan menggunakan "use client" di komponen
2. Import hook dengan benar: `import useNotification from "@/hooks/useNotification"`

### Problem: Styling tidak sesuai
**Solusi:**
1. Pastikan Tailwind CSS terkonfigurasi dengan benar
2. Cek urutan CSS import
3. Gunakan dev tools untuk debug styling

## Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Performance
- Ringan: ~3KB gzipped
- Re-render minimal dengan useCallback
- Smooth animation dengan CSS transitions
- Auto cleanup untuk mencegah memory leaks

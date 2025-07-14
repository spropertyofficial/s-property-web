# Panduan Akses Sistem Registrasi

## Akses Admin Dashboard

### 1. Login Admin
- **URL**: `http://localhost:4004/admin/login`
- **Username**: admin
- **Password**: [password yang telah ditetapkan di sistem]

### 2. Menu Registrasi
Setelah login berhasil, Anda dapat mengakses halaman manajemen registrasi melalui:

#### Via Navigasi Sidebar:
- Klik menu **"Registrasi"** di sidebar kiri
- Ikon: 👤➕ (User Plus)
- Posisi: Urutan ke-3 dalam menu utama

#### Via URL Langsung:
- **URL**: `http://localhost:4004/admin/registrations`

## Fitur yang Tersedia

### Dashboard Registrasi
- **Statistik Real-time**: Total registrasi, pending, approved, rejected
- **Filter & Search**: Filter berdasarkan status, tanggal, nama
- **Pagination**: Navigasi halaman untuk data banyak
- **Actions**: View detail, update status, delete

### Export Data
- **Excel Export**: Download semua data registrasi
- **Filtered Export**: Export data sesuai filter yang diterapkan
- **Format**: File Excel (.xlsx) dengan semua informasi lengkap

### Update Status
- **Pending**: Status awal registrasi
- **Approved**: Registrasi disetujui
- **Rejected**: Registrasi ditolak
- **Under Review**: Sedang dalam proses review

## Struktur Data Registrasi

### Informasi Personal
- Nama lengkap
- Tempat & tanggal lahir
- No. HP & Email
- Domisili/Kota
- No. Referral (opsional)

### Dokumen
- **KTP**: File scan/foto KTP
- **NPWP**: File scan/foto NPWP dengan nomor
- **Buku Tabungan**: File scan/foto buku tabungan

### Informasi Bank
- Nama bank
- Nomor rekening
- Nama pemegang rekening

## Navigasi Menu Lengkap

```
Admin Panel
├── 📊 Dashboard
├── 📈 Analytics  
├── 👤➕ Registrasi          ← MENU BARU
├── 🏢 Properti
│   ├── Perumahan
│   ├── Ruko
│   ├── Apartemen
│   ├── Tanah
│   └── Kavling
├── 🏷️ Kategori
│   ├── Tipe Aset
│   ├── Status Pasar
│   └── Status Listing
├── 🌍 Explore Cities
├── 👥 Manajemen Admin
└── ⚙️ Pengaturan
```

## Tips Penggunaan

### 1. Filter Efektif
- Gunakan filter status untuk melihat registrasi berdasarkan kondisi tertentu
- Filter tanggal untuk melihat registrasi dalam periode waktu
- Search box untuk mencari nama atau email spesifik

### 2. Export Data
- Klik tombol "Export Excel" untuk download semua data
- Atau gunakan filter terlebih dahulu, lalu export untuk data spesifik
- File akan otomatis terdownload dengan nama berformat: `registrations_YYYYMMDD_HHMMSS.xlsx`

### 3. Update Status
- Klik tombol action di kolom terakhir setiap baris
- Pilih status baru dari dropdown
- Konfirmasi perubahan dengan SweetAlert popup

### 4. View Detail
- Klik tombol "View" untuk melihat detail lengkap registrasi
- Modal akan menampilkan semua informasi termasuk preview dokumen
- Dapat melihat file upload yang telah disubmit

## Troubleshooting

### 1. Tidak Bisa Login
- Pastikan menggunakan kredensial admin yang benar
- Clear browser cache dan cookies
- Cek console browser untuk error

### 2. Menu Registrasi Tidak Muncul
- Refresh halaman browser
- Logout dan login kembali
- Pastikan role user adalah admin

### 3. Data Tidak Muncul
- Cek koneksi database MongoDB
- Pastikan ada data registrasi yang sudah disubmit
- Cek network tab di developer tools

## Support
Untuk bantuan teknis atau pertanyaan lainnya, hubungi tim development.

---
*Update: Menu registrasi telah ditambahkan ke admin dashboard dengan URL `/admin/registrations`*

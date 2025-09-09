# Rencana Pengembangan & Daftar Tugas: Fitur Chat Terpusat (V1.0)

Dokumen ini merinci tugas-tugas teknis untuk membangun Fitur Chat Terpusat, mulai dari fondasi backend hingga antarmuka frontend yang fungsional.

---

## Milestone 1: Fondasi & Backend Inti
**Fokus:** Menyiapkan semua kebutuhan server agar sistem dapat menerima dan menyimpan percakapan.

- [x] Mendaftar akun Twilio dan membeli nomor WhatsApp Business
- [x] Mendapatkan kredensial API (Account SID, Auth Token)
- [x] Menambahkan kredensial ke `.env.local` dan Vercel Environment Variables

### Tugas 1.2: Perbarui Model Database
- [x] Buat model baru `ChatMessage.js` untuk menyimpan pesan (pengirim, isi, timestamp)
- [x] Perbarui model `Lead.js` dengan field `conversationId` agar setiap lead terhubung ke riwayat percakapan

### Tugas 1.3: Buat API Webhook Penerima Pesan
- [x] Buat endpoint baru `POST /api/whatsapp/webhook`
- [x] Implementasikan logika penerimaan pesan dari Twilio
- [x] Logika inti:
    - Saat pesan masuk, periksa apakah nomor pengirim sudah ada di database Leads
    - Jika belum, buat Lead baru
    - Simpan pesan ke koleksi ChatMessage

### Tugas 1.4: Buat API untuk Frontend
- [ ] Buat endpoint `GET /api/conversations` untuk mengambil daftar percakapan agen yang login
- [ ] Buat endpoint `POST /api/conversations/reply` untuk mengirim balasan (menggunakan API Twilio)

---

## Milestone 2: Antarmuka Kotak Masuk (Frontend) 🖥️
**Fokus:** Membangun halaman "Kotak Masuk" agar agen dapat melihat dan membalas pesan.

### Tugas 2.1: Buat Halaman & Layout Dasar Kotak Masuk
- [ ] Buat halaman baru di `/admin/inbox`
- [ ] Rancang layout tiga panel (Daftar Chat, Jendela Chat, Info Lead) dengan Tailwind CSS dan pastikan responsif

### Tugas 2.2: Implementasi Daftar Percakapan (Panel Kiri)
- [ ] Buat komponen daftar percakapan (data dari `GET /api/conversations`)
- [ ] Implementasikan klik untuk memilih percakapan aktif

### Tugas 2.3: Implementasi Jendela Chat (Panel Tengah)
- [ ] Buat komponen riwayat pesan percakapan aktif
- [ ] Buat form input untuk mengetik dan mengirim balasan (terhubung ke `POST /api/conversations/reply`)

### Tugas 2.4: Implementasi Panel Info Lead (Panel Kanan)
- [ ] Buat komponen detail Lead terkait percakapan aktif

---

## Milestone 3: Logika Distribusi & Eskalasi (Backend "Cerdas") 🧠
**Fokus:** Mengimplementasikan fitur otomatisasi inti sistem.

### Tugas 3.1: Implementasi Logika Distribusi Leads
- [ ] Tambahkan logika round-robin di API Webhook (`POST /api/whatsapp/webhook`) untuk menugaskan lead baru ke agen bergiliran
- [ ] Catat waktu penugasan di dokumen Lead

### Tugas 3.2: Implementasi Logika Eskalasi dengan Cron Job
- [ ] Konfigurasikan Vercel Cron Job setiap menit
- [ ] Buat endpoint API baru (`GET /api/cron/check-escalations`) untuk dipanggil Cron Job
- [ ] Logika endpoint:
    - Cari leads baru yang belum direspons dan melewati batas waktu (misal, 5 menit)
    - Jika ditemukan, cabut tugas dari agen saat ini dan tugaskan ke agen berikutnya

---

## Milestone 4: Integrasi Final & Pengujian ✅
**Fokus:** Menyatukan semua bagian dan memastikan sistem berjalan lancar.

### Tugas 4.1: Integrasi Umpan Balik Eskalasi di Frontend
- [ ] Tampilkan timer eskalasi di "Kotak Masuk" untuk setiap lead baru
- [ ] Implementasikan logic untuk menghentikan timer dan "mengunci" kepemilikan lead saat agen membalas pertama kali

### Tugas 4.2: Pengujian End-to-End
- [ ] Uji semua skenario: lead baru, lead lama menghubungi kembali, dan eskalasi
- [ ] Pastikan pesan terkirim dan diterima dengan benar
- [ ] Uji di berbagai perangkat untuk memastikan responsivitas

### Tugas 4.3: Penyempurnaan & Perbaikan Bug
- [ ] Perbaiki bug yang ditemukan selama pengujian
- [ ] Tambahkan loading states dan pesan error yang jelas di seluruh antarmuka untuk pengalaman pengguna yang lebih baik

# Strategi Efisiensi Pengiriman Notifikasi WhatsApp ke Sales

## Latar Belakang
- Pesan template WhatsApp (template message) lebih mahal (~150 rupiah) dibanding pesan bebas (~83 rupiah).
- Window service WhatsApp (24 jam) terbuka setelah sales menerima pesan template, sehingga pesan bebas bisa dikirim selama window terbuka.

## Strategi Pengiriman
1. **Kirim Pesan Template Hanya untuk Membuka Window**
   - Kirim pesan template ke sales saat window service belum terbuka (atau sudah lewat 24 jam sejak pesan template terakhir).
   - Setelah window terbuka, gunakan pesan bebas untuk notifikasi berikutnya selama 24 jam.

2. **Penyimpanan Timestamp Window**
   - Simpan waktu pengiriman pesan template ke sales (misal, field `lastWindowOpenedAt` pada data sales/lead).
   - Setiap akan mengirim notifikasi:
     - Jika window masih terbuka (<24 jam sejak `lastWindowOpenedAt`), kirim pesan bebas.
     - Jika window sudah tutup (>=24 jam), kirim pesan template untuk membuka window baru, lalu update `lastWindowOpenedAt`.

## Contoh Logika Implementasi
```js
const now = Date.now();
const windowOpen = now - new Date(lastWindowOpenedAt).getTime() < 24 * 60 * 60 * 1000;

if (windowOpen) {
  // Kirim pesan bebas (murah)
} else {
  // Kirim pesan template (mahal), update lastWindowOpenedAt
}
```

## Catatan Teknis
- Kirim pesan template ke sales sudah cukup untuk membuka window service, sales tidak perlu membalas.
- Pastikan field `lastWindowOpenedAt` diupdate setiap kali pesan template dikirim.
- Gunakan pesan bebas sebanyak mungkin selama window terbuka untuk efisiensi biaya.

## Kesimpulan
- Kirim pesan template hanya untuk membuka window service WhatsApp.
- Selama window terbuka, gunakan pesan bebas untuk notifikasi selanjutnya.
- Dengan strategi ini, biaya pengiriman notifikasi WhatsApp ke sales akan jauh lebih efisien.

# Lead Assignment & Escalation Timer Documentation

## Field Reference
- **leadInAt**: Waktu pertama kali lead masuk ke sistem. Tidak berubah meskipun agent berganti.
- **assignedAt**: Waktu terakhir agent di-assign ke lead. Diupdate setiap kali agent pada lead berubah (termasuk rotasi eskalasi).

## Timer Eskalasi
- Semua perhitungan timer eskalasi dan expiry (misal, komponen EscalationTimer dan logika isExpired di frontend) harus menggunakan field `assignedAt`.
- Jika agent pada lead diganti (baik oleh rotasi otomatis maupun klaim manual), field `assignedAt` harus diupdate ke waktu saat perubahan.
- Dengan demikian, timer akan selalu akurat sesuai agent yang sedang bertugas.

## Backend Logic
- Cron eskalasi dan endpoint klaim harus menggunakan `assignedAt` sebagai patokan waktu, bukan `leadInAt`.
- Contoh query eskalasi:
  ```js
  const threshold = Date.now() - escalationMinutes * 60 * 1000;
  const unclaimedLeads = await Lead.find({ isClaimed: false, source: "WhatsApp", assignedAt: { $lte: new Date(threshold) } });
  ```

## Frontend Logic
- Komponen timer (EscalationTimer) dan expiry (isExpired) harus menerima dan menghitung dari `assignedAt`.
- Contoh:
  ```js
  const assignMs = assignedAt ? new Date(assignedAt).getTime() : 0;
  // ...existing code...
  ```

## Summary
- Gunakan `assignedAt` untuk semua logika waktu eskalasi dan expiry.
- Jangan gunakan `leadInAt` untuk timer, karena hanya merepresentasikan waktu masuk awal lead.
- Pastikan backend dan frontend konsisten menggunakan field ini.

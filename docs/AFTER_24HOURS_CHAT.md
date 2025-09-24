Berikut adalah panduan teknis untuk mengidentifikasi window chat WhatsApp yang sudah lebih dari 24 jam (window service tutup) dan cara mengirim pesan follow up ke konsumen menggunakan Twilio:

## 1. Identifikasi Window 24 Jam

- **Definisi:** Window 24 jam dimulai setiap kali user (konsumen) mengirim pesan ke bisnis Anda.
- **Aturan:** Anda dapat membalas dengan pesan bebas (freeform) selama 24 jam sejak pesan terakhir dari user. Setelah 24 jam berlalu tanpa pesan baru dari user, hanya pesan template yang dapat dikirim.

## Cara Identifikasi Secara Teknis

1. Catat timestamp setiap kali user mengirim pesan (misal, lewat webhook Twilio).
2. Bandingkan waktu sekarang dengan timestamp pesan terakhir dari user.
3. Jika selisihnya lebih dari 24 jam, window sudah tutup. Jika kurang dari 24 jam, window masih terbuka.

```javascript
const now = Date.now() / 1000; // detik
if (now - lastUserMessageTime > 24 * 60 * 60) {
    // Window sudah tutup, hanya bisa kirim template
} else {
    // Window masih terbuka, bisa kirim pesan bebas
}
```
---

**Identifikasi window:** Cek timestamp pesan terakhir user.
**Jika sudah >24 jam:** Kirim pesan follow up menggunakan template message (bukan pesan bebas).
**Gunakan Content SID & Content Variables** untuk pengiriman template di luar window.

---
## 3. Tips Praktis

- **Otomatisasi:** Simpan timestamp pesan terakhir user di database, dan buat scheduler untuk cek siapa saja yang sudah lebih dari 24 jam tidak membalas.
- **Follow up:** Kirim template message ke user yang window-nya sudah tutup, misal untuk reminder, promo, atau menanyakan feedback.

---

## 4. Skenario Perubahan Implementasi

### 1. Standarisasi Timestamp Pesan
- Gunakan field `sentAt` untuk semua pesan (inbound dan outbound) sebagai acuan waktu pesan dikirim/diterima.
- Pastikan setiap handler (webhook, reply, dsb) selalu mengisi `sentAt` secara eksplisit dengan waktu yang benar (dari Twilio jika ada, atau Date.now).

### 2. Identifikasi Window 24 Jam
- Saat ingin mengirim pesan ke user, cek pesan terakhir dari user (ChatMessage dengan direction: "inbound", urutkan `sentAt`).
- Jika selisih waktu sekarang dengan `sentAt` pesan inbound terakhir > 24 jam, window tutup.

### 3. Pengiriman Pesan di Luar Window
- Jika window tutup, API reply harus menolak pesan bebas dan hanya mengizinkan pengiriman template message (`contentSid`, `contentVariables`).
- Utility Twilio harus mendukung pengiriman template message sesuai format terbaru.

### 4. Update Model & Query
- Pastikan query untuk identifikasi window 24 jam konsisten menggunakan `sentAt` pada pesan inbound terakhir.
- Tambahkan helper di backend untuk mengambil pesan inbound terakhir per lead.

### 5. Update Frontend
- Tampilkan status window (terbuka/tutup) di UI chat.
- Disable input pesan bebas jika window tutup, dan tampilkan opsi kirim template.

### 6. Dokumentasi & Testing
- Update dokumentasi teknis agar developer paham alur timestamp dan window.
- Buat test case untuk skenario pengiriman pesan di dalam dan di luar window.

### 7. Opsional: Migrasi Data Lama
- Jika sebelumnya ada pesan inbound yang tidak mengisi `sentAt` dengan benar, lakukan migrasi data agar field tersebut terisi sesuai waktu pesan.

---

Skenario ini memastikan sistem chat WhatsApp Anda comply dengan aturan Meta, mudah di-maintain, dan UX tetap jelas bagi agent dan user.

- **WAJIB** menggunakan template message yang sudah di-approve oleh WhatsApp (Meta).
- Template message dikirim menggunakan parameter `contentSid` dan `contentVariables` (bukan lagi `body`), terutama setelah April 2025.

### Contoh Kirim Template Message via Twilio (JavaScript)

```javascript
const twilio = require('twilio');
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);

client.messages
  .create({
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+62xxxxxxxxxx',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e', // SID template Anda
    contentVariables: JSON.stringify({ '1': 'Nama Konsumen', '2': 'Promo Spesial' })
  })
  .then(message => console.log(message.sid))
  .catch(error => console.error(error));
```

- `contentSid`: SID dari template yang sudah di-approve.
- `contentVariables`: Variabel yang akan diisi ke dalam template.

---

## 5. Daftar File Terkait & Perlu Dirubah

Berikut file yang perlu diubah agar comply dengan skenario window 24 jam WhatsApp (identifikasi terbaru):

1. src\app\api\whatsapp\webhook\route.js
   - Menyimpan pesan inbound dari user, timestamp, dan direction.  
   - Tambahkan helper/query untuk mengambil pesan inbound terakhir per lead.

2. src\app\api\conversations\route.js
   - Endpoint pengelolaan percakapan/chat.  
   - Expose status window (terbuka/tutup) di level chat window, berdasarkan pesan inbound terakhir.

3. src\lib\models\ChatMessage.js 
   - Model ChatMessage, field `sentAt`, `direction`.  
   - Pastikan query dan struktur mendukung identifikasi window 24 jam.

4. src\lib\models\Lead.js  
   - Model Lead, relasi ke ChatMessage.  
   - Opsional: cache timestamp pesan inbound terakhir untuk efisiensi.

5. src\app\(chat)\chat\ui\ConversationsList.jsx 
   - UI chat, menampilkan status window dan input pesan.  
   - Disable input pesan bebas jika window tutup, aktifkan tombol kirim template.

6. src\app\(chat)\chat\ui\ChatWindow.jsx
   - UI detail percakapan/chat.  
   - Sinkronisasi status window dan logika input pesan.

Catatan:
- Handler pesan outbound (`reply/route.js`) dan cron/follow up otomatis tidak perlu diubah.
- Utility Twilio hanya perlu mendukung pengiriman template jika window tutup (jika dipakai di frontend).

---

Silakan masukkan hasil identifikasi ini ke bagian tersebut pada dokumentasi Anda.

## 6. Update Terakhir Diskusi

- Hanya pesan inbound (dari user) yang menjadi acuan window 24 jam.
- Pesan outbound (dari bisnis ke user) tidak mempengaruhi status window.
- Status window cukup diekspos di level chat window, bukan per percakapan.
- Jika >24 jam sejak pesan inbound terakhir, input pesan bebas di frontend harus disabled, dan hanya tombol kirim template yang aktif.
- Tidak perlu follow up otomatis; biarkan agent/manual.

Fokus perubahan pada logika identifikasi pesan inbound terakhir dan expose status window di chat window. Outbound dan follow up otomatis tidak perlu diubah.
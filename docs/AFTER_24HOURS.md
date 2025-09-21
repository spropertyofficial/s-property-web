Berikut adalah panduan teknis untuk mengidentifikasi window chat WhatsApp yang sudah lebih dari 24 jam (window service tutup) dan cara mengirim pesan follow up ke konsumen menggunakan Twilio:

## 1. Identifikasi Window 24 Jam

- **Definisi:** Window 24 jam dimulai setiap kali user (konsumen) mengirim pesan ke bisnis Anda.
- **Aturan:** Anda dapat membalas dengan pesan bebas (freeform) selama 24 jam sejak pesan terakhir dari user. Setelah 24 jam berlalu tanpa pesan baru dari user, hanya pesan template yang dapat dikirim.

### Cara Identifikasi Secara Teknis

1. Catat timestamp setiap kali user mengirim pesan (misal, lewat webhook Twilio).
2. Bandingkan waktu sekarang dengan timestamp pesan terakhir dari user.
3. Jika selisihnya lebih dari 24 jam, window sudah tutup. Jika kurang dari 24 jam, window masih terbuka.

```python
if now - last_user_message_time > 24 * 60 * 60:
    # Window sudah tutup, hanya bisa kirim template
else:
    # Window masih terbuka, bisa kirim pesan bebas
```

## 2. Mengirim Pesan Follow Up di Luar Window 24 Jam

- **WAJIB** menggunakan template message yang sudah di-approve oleh WhatsApp (Meta).
- Template message dikirim menggunakan parameter `content_sid` dan `content_variables` (bukan lagi `body`), terutama setelah April 2025.

### Contoh Kirim Template Message via Twilio (Python)

```python
from twilio.rest import Client
import json

client = Client(account_sid, auth_token)

message = client.messages.create(
    from_="whatsapp:+14155238886",
    to="whatsapp:+62xxxxxxxxxx",
    content_sid="HXb5b62575e6e4ff6129ad7c8efe1f983e",  # SID template Anda
    content_variables=json.dumps({"1": "Nama Konsumen", "2": "Promo Spesial"})
)
```

- `content_sid`: SID dari template yang sudah di-approve.
- `content_variables`: Variabel yang akan diisi ke dalam template.

## 3. Tips Praktis

- **Otomatisasi:** Simpan timestamp pesan terakhir user di database, dan buat scheduler untuk cek siapa saja yang sudah lebih dari 24 jam tidak membalas.
- **Follow up:** Kirim template message ke user yang window-nya sudah tutup, misal untuk reminder, promo, atau menanyakan feedback.

## Kesimpulan

- **Identifikasi window:** Cek timestamp pesan terakhir user.
- **Jika sudah >24 jam:** Kirim pesan follow up menggunakan template message (bukan pesan bebas).
- **Gunakan Content SID & Content Variables** untuk pengiriman template di luar window.

Jika Anda membutuhkan contoh kode untuk bahasa lain, atau ingin tahu cara membuat template di Twilio Console, silakan tanya!

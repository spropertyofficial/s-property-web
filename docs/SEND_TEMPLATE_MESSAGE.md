## Cara Mengirim WhatsApp Template Message di Next.js dengan Twilio

Berikut langkah-langkah untuk mengirim pesan template WhatsApp menggunakan Twilio di Next.js:

### 1. Prasyarat
- Sudah memiliki Content Template yang di-approve di Twilio Console (dapatkan Content SID).
- Memiliki Twilio Account SID dan Auth Token.
- Nomor WhatsApp sender sudah terdaftar di Twilio.

### 2. Instalasi Twilio SDK
Jalankan perintah berikut di terminal:

```bash
npm install twilio
```

### 3. Contoh Kode Next.js API Route
Buat file `/pages/api/send-wa-template.js` dengan isi berikut:

```javascript
// pages/api/send-wa-template.js
import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(req) {
    const { to, contentSid, contentVariables } = await req.json();

    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886', // Ganti dengan nomor WhatsApp Twilio Anda
            to: `whatsapp:${to}`,
            contentSid: contentSid,
            contentVariables: JSON.stringify(contentVariables),
        });

        return NextResponse.json({ success: true, sid: message.sid });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
```

### 4. Cara Memanggil API dari Frontend
Contoh pemanggilan dari komponen React:

```javascript
await fetch('/api/send-wa-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        to: '+6281234567890',
        contentSid: 'HXxxxxxxx', // Ganti dengan Content SID Anda
        contentVariables: { "1": "Budi", "2": "INV12345" }
    })
});
```

### 5. Catatan Penting
- **contentSid**: Dapatkan dari Content Template Builder di Twilio Console.
- **contentVariables**: Isi sesuai variabel pada template Anda.
- **from**: Gunakan nomor WhatsApp Twilio yang sudah di-approve.


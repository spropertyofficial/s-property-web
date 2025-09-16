# Skenario: Menjalankan Eskalasi Leads Menggunakan GitHub Actions

## Konsep Utama
Kita akan mengkonfigurasi sebuah "robot" di repository GitHub Anda. Robot ini akan otomatis aktif setiap 5 menit, memanggil API eskalasi di Vercel, lalu kembali "tidur".

---

## Pra-syarat: Mengamankan API Endpoint

### 1. Buat Kunci Rahasia
Tentukan kunci rahasia yang panjang dan sulit ditebak, misal: `ks93j-dh23s-29jsd-lkas9`.

### 2. Simpan Kunci di Vercel
- Buka dasbor proyek Vercel Anda.
- Masuk ke **Settings → Environment Variables**.
- Tambahkan secret baru:
    - **Nama:** `CRON_SECRET`
    - **Nilai:** `ks93j-dh23s-29jsd-lkas9`

### 3. Perbarui API Anda
Modifikasi endpoint `/api/cron/check-escalations` agar memeriksa kunci ini.

```javascript
// src/app/api/cron/check-escalations/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Akses tidak diizinkan' }, { status: 401 });
    }
    // ... Lanjutkan logika eskalasi Anda di sini ...
    return NextResponse.json({ message: 'Proses eskalasi berhasil dijalankan.' });
}
```

---

## Implementasi di GitHub Actions

### Langkah 1: Menyimpan Informasi Rahasia di GitHub
- Buka repository GitHub Anda.
- Masuk ke **Settings → Secrets and variables → Actions**.
- Klik **New repository secret** dan tambahkan:
    - **VERCEL_DEPLOYMENT_URL:** `https://s-property-anda.vercel.app`
    - **CRON_SECRET:** `ks93j-dh23s-29jsd-lkas9`

### Langkah 2: Membuat File Workflow
Buat folder dan file workflow:

```powershell
# Di root folder proyek Anda
New-Item -ItemType Directory -Path ".github/workflows" -Force
New-Item -ItemType File -Path ".github/workflows/escalation_cron.yml" -Force
```

### Langkah 3: Menulis Workflow YAML

```yaml
name: Check Lead Escalations Cron Job

on:
    schedule:
        - cron: '*/5 * * * *' # Setiap 5 menit
    workflow_dispatch:

jobs:
    trigger_escalation:
        runs-on: ubuntu-latest
        steps:
            - name: Trigger Vercel Endpoint
                run: |
                    curl -X GET \
                    -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
                    "${{ secrets.VERCEL_DEPLOYMENT_URL }}/api/cron/check-escalations"
```

### Langkah 4: Commit & Push ke GitHub
Setelah file workflow dibuat, lakukan commit dan push ke repository Anda. GitHub akan otomatis menjalankan workflow sesuai jadwal.

---

## Verifikasi

1. Buka repository GitHub Anda.
2. Klik tab **Actions**.
3. Cari workflow **Check Lead Escalations Cron Job** dan cek log eksekusinya untuk memastikan semuanya berjalan lancar.


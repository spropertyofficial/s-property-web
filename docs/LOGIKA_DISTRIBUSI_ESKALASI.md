## Komponen & API Dependencies Distribusi dan Eskalasi

### Backend
- `src/app/api/whatsapp/webhook/route.js`  
	Distribusi lead baru ke agent giliran, update pointer rotasi, notifikasi agent.
- `src/app/api/cron/check-escalations/route.js`  
	Eskalasi lead yang belum direspons, pindah ke agent berikutnya, update pointer rotasi, notifikasi agent.
- `src/app/api/leads/[id]/assign/route.js`  
	Proses klaim lead oleh agent, validasi giliran, update status klaim.
- `src/app/api/agent-queue/route.js`  
	Manajemen urutan, status aktif, dan pointer agent queue.
- Model:  
	- `src/lib/models/Lead.js` (field: agent, isClaimed, status, source, dsb)  
	- `src/lib/models/AgentQueue.js`

### Frontend
- `src/app/(chat)/chat/ui/ChatInboxPageContent.jsx`  
	Menampilkan status distribusi, timer eskalasi, agent "sibuk".
- `src/app/(chat)/chat/ui/ConversationsList.jsx`  
	Tombol klaim, status agent, filter lead, notifikasi UI.
- `src/app/(chat)/chat/ui/LeadInfoPanel.jsx`  
	Detail status lead dan agent, info distribusi/eskalasi.
- `src/app/(admin)/admin/agent-queue/page.js`  
	Admin: pengaturan urutan, status, pointer agent, durasi eskalasi.

### Lainnya
- `.github/workflows/escalation_cron.yml`  
	Cron job pemicu eskalasi otomatis.
- `docs/LOGIKA_DISTRIBUSI_ESKALASI.md`  
	Dokumentasi logika dan dependensi distribusi/eskalasi.

## Bagaimana Cara Kerjanya

### 1. Antrian Leads (Global)
Semua lead baru yang masuk (misal: Lead 1, 2, 3, 4) akan masuk ke dalam satu **kolam antrian global**, diurutkan berdasarkan waktu kedatangan.

### 2. Antrian Agen (Rotasi)
Terdapat daftar giliran agen yang siap menerima tugas, misalnya: **A → B → C → D → E**.

### 3. Mesin Penjodoh (Logika Inti)
Sistem bekerja sebagai berikut:

- **10:00**: Lead 1 masuk. Sistem menunjuk giliran Agen **A**. Lead 1 ditugaskan ke Agen A, timer 5 menit dimulai. Agen A menjadi "sibuk".
- **10:01**: Lead 2 masuk. Sistem menunjuk giliran berikutnya, Agen **B**. Lead 2 ditugaskan ke Agen B, timer baru dimulai. Agen B menjadi "sibuk".
- **10:02**: Lead 3 masuk. Sistem menunjuk giliran berikutnya, Agen **C**. Lead 3 ditugaskan ke Agen C. Agen C menjadi "sibuk".

**Hasil:**  
Tiga lead yang masuk hampir bersamaan akan ditangani secara paralel oleh tiga agen berbeda. Tidak ada penumpukan. Waktu tunggu setiap pelanggan diminimalkan.

## Logika Eskalasi dalam Sistem Ini
### Alur Distribusi & Eskalasi Lead

1. **Lead Masuk:**  
    Lead baru masuk ke antrian global, diurutkan berdasarkan waktu kedatangan.

2. **Rotasi Agen:**  
    Agen yang siap menerima tugas dirotasi secara round-robin (misal: A → B → C → D → E).

3. **Distribusi Otomatis:**  
    Setiap lead baru langsung ditugaskan ke agen berikutnya yang tersedia, dan timer eskalasi dimulai.

4. **Paralel & Merata:**  
    Jika beberapa lead masuk hampir bersamaan, masing-masing didistribusikan ke agen berbeda sehingga tidak menumpuk di satu agen.

5. **Eskalasi:**  
    Jika lead belum direspons dalam waktu tertentu (timer habis), lead dicabut dari agen lama dan ditugaskan ke agen berikutnya dalam rotasi.

6. **Satu Lead per Agen:**  
    Setiap agen hanya menangani satu lead pada satu waktu. Distribusi dan eskalasi berjalan otomatis dan merata.

**Tujuan:**
- Tidak ada lead yang menunggu terlalu lama.
- Distribusi tugas ke agen benar-benar merata dan adil.
- Eskalasi otomatis jika agen tidak respons.

**Kesimpulan:**  
Setiap agen menangani satu lead pada satu waktu. Setiap lead baru langsung ditangani oleh agen berikutnya yang tersedia, sehingga tidak ada lead yang menunggu terlalu lama di tumpukan.


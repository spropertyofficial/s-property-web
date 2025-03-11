# Panduan Penamaan File Proyek Web

## Prinsip Dasar Penamaan File

### Aturan Umum
1. Gunakan huruf kecil (lowercase)
2. Gunakan tanda hubung (-) untuk memisahkan kata
3. Hindari spasi, garis bawah, atau karakter khusus
4. Nama file harus deskriptif namun singkat
5. Gunakan format `.webp` untuk semua gambar

## Struktur Penamaan File
 Format dasar: `[kategori]-[deskripsi]-[tipe].webp`

### Kategori File

#### 1. Main Views
- **Deskripsi**: Gambar utama proyek
- **Format**: `main-[deskripsi].webp`
- **Contoh**:
  - `main-overview.webp`
  - `masterplan-project.webp`
  - `entrance-gate.webp`

#### 2. Access
- **Deskripsi**: Akses dan lokasi proyek
- **Format**: `access-[jenis]-route.webp` atau `location-[deskripsi].webp`
- **Contoh**:
  - `access-toll-route.webp`
  - `access-train-route.webp`
  - `location-site.webp`

#### 3. Facilities
- **Deskripsi**: Fasilitas proyek
- **Format**: `facilities-[deskripsi].webp`
- **Contoh**:
  - `facilities-overview.webp`
  - `facilities-amenities.webp`

#### 4. Unit Types
- **Deskripsi**: Tipe unit atau ruangan
- **Format**: `type-[nomor]-[deskripsi].webp`
- **Contoh**:
  - `type-22-overview.webp`
  - `type-27-layout.webp`
  - `type-36-details.webp`

#### 5. Specifications
- **Deskripsi**: Spesifikasi teknis
- **Format**: `specs-[kategori]-[detail].webp`
- **Contoh**:
  - `specs-building-structure.webp`
  - `specs-material-quality.webp`

#### 6. Clusters
- **Deskripsi**: Area atau klaster khusus
- **Format**: `cluster-[nama]-[deskripsi].webp`
- **Contoh**:
  - `cluster-[nama]-overview.webp`
  - `cluster-[nama]-layout.webp`

#### 7. Floor Plans
- **Deskripsi**: Denah atau tata letak
- **Format**: `floorplan-type-[nomor].webp`
- **Contoh**:
  - `floorplan-type-22.webp`
  - `floorplan-type-27.webp`

## Panduan Praktis

### Tips Penamaan
- Gunakan deskripsi yang jelas dan singkat
- Pertahankan konsistensi dalam seluruh proyek
- Hindari singkatan yang tidak umum
- Gunakan nomor dengan padding dua digit (22, 27)

### Contoh Salah dan Benar

#### Salah
- `MAIN.webp`
- `type 22.webp`
- `facilities_overview.webp`
- `ACCESS TRAIN.webp`

#### Benar
- `main-overview.webp`
- `type-22-overview.webp`
- `facilities-overview.webp`
- `access-train-route.webp`

## Struktur Direktori Rekomendasi

```
public/
└── images/
    ├── residentials/
    │   └── [nama-proyek]/
    │       ├── main/
    │       ├── access/
    │       ├── facilities/
    │       ├── types/
    │       ├── specs/
    │       ├── clusters/
    │       └── floorplans/
```
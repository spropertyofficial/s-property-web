```markdown
# Dokumentasi Struktur Properti

## Struktur URL Properti

### Listing Properti
- `/properties` - Landing properti
- `/properties/residentials` - Listing residential
- `/properties/clusters` - Listing cluster
- `/properties/units` - Listing unit

### Detail Properti
- `/properties/residential/[id]` - Detail residential
- `/properties/[residential-id]/[cluster-id]` - Detail cluster
- `/properties/[residential-id]/[cluster-id]/[unit-id]` - Detail unit

## Struktur Folder Properti

```
app/properties/
│
├── page.tsx                    # Landing page properti utama
│
├── layout.tsx                  # Layout khusus properti
│
├── residentials/
│   └── page.tsx                # Listing semua residential
│
├── clusters/
│   └── page.tsx                # Listing semua cluster
│
├── units/
│   └── page.tsx                # Listing semua unit
│
├── residential/
│   └── [id]/
│       └── page.tsx            # Detail residential
│
├── [residential-id]/
│   └── [cluster-id]/
│       └── page.tsx            # Detail cluster
│
└── [residential-id]/
    └── [cluster-id]/
        └── [unit-id]/
            └── page.tsx        # Detail unit
```

## Struktur Komponen

```
src/components/
│
├── common/
│   ├── PropertyCard/
│   │   └── PropertyCard.js
│   └── PropertyListing/
│       └── PropertyListing.js
│
└── sections/
    ├── ResidentialDetail/
    │   └── ResidentialDetail.js
    ├── ClusterDetail/
    │   └── ClusterDetail.js
    └── UnitDetail/
        └── UnitDetail.js
```
```

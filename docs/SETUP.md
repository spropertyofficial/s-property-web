# Real Estate Project Setup

## Requirements
- Node.js 18.17 or later
- npm v9.6.7 or later

## Tech Stack
- Next.js 14
- Tailwind CSS
- Lucide Icons
- HeadlessUI

## Installation Steps
1. Clone repository
```bash
git clone https://github.com/dvpms/s-property_web
cd s-property_web
```



Baik, pendekatan "Mobile First" memang sangat tepat. Dan dokumentasi sangat penting untuk project perusahaan. Mari kita strukturkan dengan lebih baik:

1. Pertama, mari buat file dokumentasi. Buat folder dan file baru:
```
real-estate/
  ├── docs/
  │   ├── SETUP.md
  │   ├── COMPONENTS.md
  │   └── STYLES.md
```

2. Isi `docs/SETUP.md`:
```markdown
# Real Estate Project Setup

## Requirements
- Node.js 18.17 or later
- npm v9.6.7 or later

## Tech Stack
- Next.js 14
- Tailwind CSS
- Lucide Icons
- HeadlessUI

## Installation Steps
1. Clone repository
```bash
git clone [repository-url]
cd real-estate
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

## Project Structure
```
real-estate/
  ├── src/
  │   ├── app/         # Next.js pages
  │   ├── components/  # Reusable components
  │   └── styles/      # Global styles
  ├── public/          # Static files
  └── docs/            # Documentation
```

## Development Guidelines
1. Mobile First Approach
   - Develop for mobile screens first
   - Use Tailwind breakpoints for larger screens:
     - sm: 640px
     - md: 768px
     - lg: 1024px
     - xl: 1280px

2. Color Palette
   - Primary: #3aa9a2 (Tosca)
   - Primary Dark: #316f6b
   - Secondary Blue: #3f51b5
   - Secondary Green: #4caf50
   - Dark Green: #1b5e20
```
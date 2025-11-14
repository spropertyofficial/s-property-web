# S-Property Web Documentation

## Setup & Requirements
- Node.js 18.17 or later
- npm v9.6.7 or later

## Tech Stack
- Next.js 14
- Tailwind CSS
- Lucide Icons
- HeadlessUI

## Installation Steps
```bash
git clone https://github.com/dvpms/s-property_web
cd s-property_web
npm install
npm run dev
```

## Project Structure
```
s-property-web/
  ├── src/
  │   ├── app/         # Next.js pages
  │   ├── components/  # Reusable components
  │   └── styles/      # Global styles
  └── public/          # Static files
```

## Property URL Structure

### Listing Pages
- `/properties` - Landing properti
- `/properties/residentials` - Listing residential
- `/properties/clusters` - Listing cluster
- `/properties/units` - Listing unit

### Detail Pages  
- `/properties/residential/[id]` - Detail residential
- `/properties/[residential-id]/[cluster-id]` - Detail cluster
- `/properties/[residential-id]/[cluster-id]/[unit-id]` - Detail unit

## Components Structure
```
src/components/
├── common/
│   ├── PropertyCard/
│   │   └── PropertyCard.js
│   └── PropertyListing/
│       └── PropertyListing.js
└── sections/
    ├── ResidentialDetail/
    │   └── ResidentialDetail.js
    ├── ClusterDetail/
    │   └── ClusterDetail.js
    └── UnitDetail/
        └── UnitDetail.js
```

## Struktur Folder Properti
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

## Color Palette

### Tosca Colors
Primary brand colors:
- `tosca-50`: #7BFCF3 (Lightest) - Highlights and accents
- `tosca-100`: #4BD3CB - Secondary elements  
- `tosca-200`: #3AA9A2 (Primary) - Main brand color
- `tosca-300`: #2A817B - Hover states
- `tosca-400`: #1B5857 - Text on light backgrounds
- `tosca-500`: #0D3735 (Darkest) - Deep backgrounds

### Blue Colors  
Secondary colors:
- `blue-50`: #DAE8FA (Lightest) - Light backgrounds
- `blue-100`: #95C3F2 - Subtle highlights
- `blue-200`: #4E9EDD (Primary) - Interactive elements
- `blue-300`: #3A78A9 - Hover states
- `blue-400`: #275478 - Text contrast
- `blue-500`: #051420 (Darkest) - Dark mode

### Green Colors
Success states:
- `green-50`: #85FBB3 (Lightest) - Success states
- `green-100`: #4BD487 - Positive indicators
- `green-200`: #3AA96B (Primary) - CTAs
- `green-300`: #2A8050 - Hover states
- `green-400`: #1B5936 - Text on light
- `green-500`: #031409 (Darkest) - Dark accents

### Gray Colors
Neutral colors:
- `gray-50`: #E3E9E9 (Lightest) - Backgrounds
- `gray-100`: #BCC1C1 - Borders
- `gray-200`: #969A9A (Primary) - Secondary text
- `gray-300`: #727575 - Placeholder text
- `gray-400`: #505252 - Primary text
- `gray-500`: #131414 (Darkest) - Headings


## Development Guidelines

### Mobile First Approach
We follow mobile-first responsive design using Tailwind breakpoints:
- sm: 640px
- md: 768px  
- lg: 1024px
- xl: 1280px

### Component Best Practices
- Use LoadingWrapper for consistent loading states
- Follow atomic design principles
- Keep components small and focused
- Use TypeScript for type safety
- Document component props

### State Management
- Use Redux Toolkit for global state
- RTK Query for data fetching
- Local state for UI-only concerns

### Code Style
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Component-based CSS with Tailwind

### Performance
- Optimize images with next/image
- Lazy load components when possible
- Use proper caching strategies
- Monitor bundle size

## Notifications (PWA Web Push)

Agent alerts (new WhatsApp leads, escalations) use Web Push via a dedicated service worker. See `docs/NOTIFICATIONS.md` for setup, environment variables (VAPID keys), and testing instructions.

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License
MIT License - see LICENSE.md

## Contact
For questions or support, please contact the development team.

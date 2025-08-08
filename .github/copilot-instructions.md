# S-Property Web Application

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

S-Property is a Next.js 15 property management web application with MongoDB database, JWT authentication, and PWA capabilities. It manages residential properties with hierarchical structure: residentials > clusters > units.

## Working Effectively

### Initial Setup & Dependencies
```bash
# Install Node.js dependencies (takes ~2 minutes)
npm install

# CRITICAL: Create environment file - Application CANNOT run without this
cp .env.local.example .env.local  # If example exists, or create manually
```

### Required Environment Variables (.env.local)
```bash
# MongoDB Configuration - REQUIRED for database operations
MONGODB_URI=mongodb://localhost:27017/s-property-dev

# JWT Secret for authentication - REQUIRED for auth to work
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Cloudinary Configuration - REQUIRED for image uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration - Optional for notifications
EMAIL_FROM=noreply@sproperty.co.id
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application URLs - Optional, has defaults
NEXT_PUBLIC_DOMAIN=http://localhost:4004
NEXT_PUBLIC_API_URL=http://localhost:4004/api
```

### Build Commands
```bash
# Development server - runs on port 4004, ready in ~3 seconds
npm run dev

# Production build - NEVER CANCEL
# TIMEOUT: Set to 20+ minutes for production builds
# NOTE: May fail in restricted networks due to Google Fonts - see Known Issues
npm run build

# Start production server (requires build first)
npm run start
```

### Validation & Quality
```bash
# ESLint validation - npm run lint has config issues, use direct ESLint instead:
npx eslint src/ --ext .js,.jsx,.ts,.tsx

# Individual file linting (always works):
npx eslint path/to/file.js

# Manual testing - ALWAYS test these scenarios after changes:
# 1. Homepage loads at http://localhost:4004
# 2. Login page loads at http://localhost:4004/login  
# 3. Admin login works at http://localhost:4004/admin/login
# 4. Properties page accessible at http://localhost:4004/properties
```

## Application Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin panel routes
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (site)/            # Public site pages  
│   ├── api/               # API routes
│   └── layout.js          # Root layout
├── components/            # Reusable React components
│   ├── layout/           # Header, Footer, Navigation
│   ├── common/           # PropertyCard, PropertyListing
│   └── sections/         # Page-specific components
├── lib/                  # Utility libraries
│   ├── mongodb.js        # Database connection
│   ├── auth.js           # JWT authentication
│   └── models/           # Mongoose schemas
├── store/                # Redux Toolkit store
└── styles/               # Global styles
```

### Database Scripts
```bash
# Create admin user (requires MongoDB connection)
npm run create-admin

# Data migration scripts
npm run migrate:residentials
npm run clean:residentials  
npm run clean:migrated
```

## Key Routes & Authentication

### Public Routes
- `/` - Homepage with property listings
- `/properties` - Property listings and search
- `/properties/residentials` - Residential listings
- `/properties/[type]/[id]` - Property details
- `/login` - User authentication
- `/register` - User registration
- `/about` - About page
- `/contact` - Contact page
- `/join-s-pro` - Agent registration
- `/simulasi-kpr` - KPR calculator

### Protected Routes (require auth token)
- `/agent/*` - Agent dashboard and tools
- `/dashboard/*` - User dashboard

### Admin Routes (require admin token)
- `/admin/login` - Admin authentication  
- `/admin/*` - Admin panel for property management

## Technical Details

### Authentication System
- JWT tokens for session management
- Three user types: admin, agent, user
- Middleware handles route protection
- Admin uses 'token' cookie, users use 'auth-token' cookie

### Styling & UI
- Tailwind CSS with custom color palette:
  - `tosca-*` (primary brand colors)
  - `blue-*` (secondary colors) 
  - `green-*` (success states)
  - `gray-*` (neutral colors)
- Responsive design (mobile-first)
- Custom components for property cards and listings

### Known Issues & Workarounds
- **npm run lint fails** with "Cannot serialize key 'parse' in parser" - Use `npx eslint` directly instead
- **Build fails with Google Fonts network error** - In restricted networks, temporarily comment out `Inter` font imports in layout files:
  ```js
  // Comment out in src/app/(site)/layout.js and src/app/(auth)/layout.js:
  // import { Inter } from "next/font/google";
  // const inter = Inter({ subsets: ["latin"] });
  // Replace {inter.className} with "font-sans" in JSX
  ```
- **Database operations fail** without MONGODB_URI - Always set environment variables first
- **Image upload requires Cloudinary** - Configure Cloudinary environment variables for full functionality

## Common Development Tasks

### Adding New Property Features
1. Update Mongoose models in `src/lib/models/`
2. Create/update API routes in `src/app/api/`
3. Update components in `src/components/common/`
4. Test both admin panel and public pages

### Authentication Changes
1. Check middleware configuration in `middleware.js`
2. Update auth utilities in `src/lib/auth.js`
3. Test all three user types (admin, agent, user)

### Styling Updates
1. Check Tailwind configuration in `tailwind.config.mjs`
2. Use custom color classes (tosca-*, blue-*, green-*, gray-*)
3. Test responsive design on mobile and desktop

### Database Schema Changes
1. Update models in `src/lib/models/`
2. Create migration scripts if needed
3. Update API endpoints
4. Test admin panel functionality

## Validation Scenarios

**ALWAYS run through these scenarios after making changes:**

### Basic Functionality Test
1. Start development server: `npm run dev`
2. Verify homepage loads without errors
3. Test navigation between main sections
4. Check responsive design on different screen sizes

### Authentication Flow Test  
1. Test user login/logout at `/login`
2. Test admin login at `/admin/login`
3. Verify protected routes redirect unauthenticated users
4. Check middleware logs for authentication flow

### Property Management Test
1. Access property listings at `/properties`
2. Test property detail pages (with and without database)
3. Verify admin can access property management
4. Check image loading and optimization

### Build & Deployment Test
1. Run production build: `npm run build` (NEVER CANCEL - wait 20+ minutes)
2. Start production server: `npm run start`
3. Test critical paths in production mode
4. Verify PWA functionality and service worker registration

## Performance Notes
- **Build Time**: 2-3 minutes in development, up to 20+ minutes in production
- **Dev Server**: ~3 seconds startup time
- **Database**: MongoDB connection pooling configured for performance
- **Images**: Next.js Image optimization with Cloudinary integration
- **PWA**: Service worker disabled in development, enabled in production

## Repository Commands Reference
```bash
# Quick validation workflow
npm install && npm run dev

# Full validation workflow  
npm install && npm run build && npm run start

# Development with linting
npm install && npm run dev
# In another terminal:
npx eslint src/ --ext .js,.jsx,.ts,.tsx

# Database operations (requires MongoDB)
npm run create-admin
npm run migrate:residentials
```
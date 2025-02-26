import { 
    Home, 
    Building2, 
    Building, 
    Map, 
    Users, 
    Calculator 
  } from 'lucide-react';
  
  export const CATEGORY_ITEMS = [
    { 
      icon: Home, 
      label: 'Rumah', 
      href: '/property/rumah',
      ariaLabel: 'Lihat properti rumah' 
    },
    { 
      icon: Building2, 
      label: 'Ruko', 
      href: '/property/ruko',
      ariaLabel: 'Lihat properti ruko' 
    },
    { 
      icon: Building, 
      label: 'Kavling', 
      href: '/property/kavling',
      ariaLabel: 'Lihat kavling tersedia' 
    },
    { 
      icon: Map, 
      label: 'Tanah', 
      href: '/property/tanah',
      ariaLabel: 'Lihat properti tanah' 
    },
    { 
      icon: Users, 
      label: 'Join S-Pro', 
      href: '/join',
      ariaLabel: 'Bergabung dengan S-Pro' 
    },
    { 
      icon: Calculator, 
      label: 'Simulasi KPR', 
      href: '/simulasi-kpr',
      ariaLabel: 'Simulasikan kredit properti' 
    },
  ];
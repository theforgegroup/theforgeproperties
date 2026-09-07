import { Property, PropertyType, ListingStatus } from '../types';

export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'prasino-lush-2',
    slug: 'prasino-lush-phase-2',
    title: 'Prasino Lush Phase 2',
    description: 'A serene, rapidly developing master-planned estate located in Kobape, Abeokuta. Developed by Geofort Africa, Prasino Lush Phase 2 offers verified titled land with perimeter fencing, access roads, gate house, drainage, recreational centre, gardening spaces, and zero agency runaround. Ideal for young professionals, first-time investors, and diaspora buyers.',
    price: 900000,
    location: 'Kobape, Abeokuta, Ogun State',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_ft: 150,
    type: PropertyType.LAND,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
    ],
    features: [
      'Perimeter Fencing',
      'Secure Gate House',
      'Paved Access Roads',
      'Engineered Drainage',
      'Recreational Centre',
      'Gardening & Green Spaces',
      'Instant Physical Allocation',
      'Perimeter Survey & Layout'
    ],
    developer: 'Geofort Africa',
    plot_sizes: ['150 SQM', '300 SQM', '500 SQM'],
    documentation: 'Deed of Assignment + Registered Survey Plan',
    payment_plan: 'Flexible installment plans available — spread payments over 3, 6, or 12 months',
    price_options: [
      { size: '150 SQM', price: 900000, formattedPrice: '₦900,000' },
      { size: '300 SQM', price: 1800000, formattedPrice: '₦1,800,000' },
      { size: '500 SQM', price: 3000000, formattedPrice: '₦3,000,000' }
    ],
    agent: {
      name: 'The Forge Verified Desk',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      phone: '+234 810 613 3572'
    },
    featured: true,
    show_on_homepage: true,
    is_coming_soon: false
  },
  {
    id: 'prasino-heights-1',
    slug: 'prasino-heights-phase-1',
    title: 'Prasino Heights Phase 1',
    description: 'Upcoming premium eco-residential scheme along the booming Epe-Ijebu growth corridor. Master-planned by Geofort Africa with planned solar lighting, dedicated commercial zone, and verified titles.',
    price: 1500000,
    location: 'Epe-Ijebu Corridor, Lagos / Ogun State',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_ft: 300,
    type: PropertyType.LAND,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop'
    ],
    features: [
      'Solar Street Lighting',
      'Perimeter Fencing',
      'Estate Commercial Hub',
      'Eco Green Belt'
    ],
    developer: 'Geofort Africa',
    plot_sizes: ['300 SQM', '500 SQM'],
    documentation: 'Registered Survey & Gazette In Process',
    payment_plan: 'Spread across up to 12 months',
    agent: {
      name: 'The Forge Verified Desk',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      phone: '+234 810 613 3572'
    },
    featured: false,
    show_on_homepage: false,
    is_coming_soon: true
  },
  {
    id: 'forge-heritage-grove',
    slug: 'the-forge-heritage-grove',
    title: 'The Forge Heritage Grove',
    description: 'High-yield boutique pocket of verified residential land for diaspora and ambitious young Nigerians located within easy reach of the Lekki-Epe expressway and Novare Mall axis.',
    price: 4500000,
    location: 'Sangotedo, Ajah Axis, Lagos State',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_ft: 300,
    type: PropertyType.LAND,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
    ],
    features: [
      'Fast-Growing Capital Appreciation',
      'Access to Major Highways',
      'Engineered Drainage System'
    ],
    developer: 'The Forge Partner Network',
    plot_sizes: ['300 SQM', '500 SQM'],
    documentation: 'Governor’s Consent (Registered Title)',
    payment_plan: 'Initial 25% deposit with 6-month flexibility',
    agent: {
      name: 'The Forge Verified Desk',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      phone: '+234 810 613 3572'
    },
    featured: false,
    show_on_homepage: false,
    is_coming_soon: true
  }
];

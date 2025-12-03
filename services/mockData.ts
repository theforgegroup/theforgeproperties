import { Property, PropertyType, ListingStatus, Lead } from '../types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: '5-Bedroom Automated Smart Villa',
    description: 'A masterpiece of modern architecture located in Pinnock Beach Estate, Lekki. This fully automated 5-bedroom detached villa features a private cinema, olympic-sized swimming pool, rooftop terrace, and custom Italian finishes throughout. A true definition of Lagos luxury living.',
    price: 850000000,
    location: 'Lekki, Lagos',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 6500,
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753333-484d9620349f?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Smart Home Automation', 'Cinema Room', 'Swimming Pool', 'Rooftop Terrace', 'BQ (2 Rooms)'],
    agent: {
      name: 'Victoria Sterling',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 01'
    },
    featured: true
  },
  {
    id: '2',
    title: 'Diplomatic Zone Mansion',
    description: 'Located in the prestigious Maitama district of Abuja, this palatial estate is designed for royalty. Sitting on 2,500sqm, it features a grand ballroom, bulletproof perimeter, expansive manicured gardens, and guest chalets perfect for diplomatic residency.',
    price: 1500000000,
    location: 'Maitama, Abuja',
    bedrooms: 7,
    bathrooms: 9,
    areaSqFt: 12000,
    type: PropertyType.ESTATE,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Bulletproof Security', 'Grand Ballroom', 'Industrial Kitchen', 'Staff Quarters', 'Elevator'],
    agent: {
      name: 'James Forge',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 02'
    },
    featured: true
  },
  {
    id: '3',
    title: 'Modern Detached Duplex in GRA',
    description: 'A newly built contemporary 5-bedroom detached duplex in the serene New GRA Phase 2, Port Harcourt. Features high ceilings, modern POP designs, fully fitted kitchen, and a spacious compound with a gatehouse and generator house.',
    price: 350000000,
    location: 'New GRA, Port Harcourt',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 4500,
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Fitted Kitchen', 'Jacuzzi', 'Stamp Concrete Floor', 'Electric Fencing', 'Carport'],
    agent: {
      name: 'Chinedu Okeke',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 04'
    },
    featured: true
  },
  {
    id: '4',
    title: 'Eko Atlantic Ocean View Penthouse',
    description: 'Experience the future of Lagos in this 25th-floor penthouse at Eko Atlantic City. Offers 360-degree views of the Atlantic Ocean and the city skyline, with world-class amenities and 24/7 independent power supply.',
    price: 950000000,
    location: 'Eko Atlantic, Lagos',
    bedrooms: 3,
    bathrooms: 4,
    areaSqFt: 3500,
    type: PropertyType.PENTHOUSE,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Ocean View', 'Helipad Access', 'Concierge Service', 'Private Gym', '24/7 Power'],
    agent: {
      name: 'Sarah Jenkins',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 03'
    },
    featured: true
  },
  {
    id: '5',
    title: 'Golf Resort Vacation Home',
    description: 'Overlooking the greens at the prestigious Lakowe Lakes Golf & Country Estate. This 4-bedroom terrace offers a serene getaway from the hustle of the city, perfect for vacation homes or short-let investment.',
    price: 180000000,
    location: 'Lakowe, Lagos',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3200,
    type: PropertyType.APARTMENT,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Golf Course Access', 'Lake View', '24/7 Security', 'Sport Center', 'Paved Roads'],
    agent: {
      name: 'Victoria Sterling',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 01'
    },
    featured: false
  },
  {
    id: '6',
    title: 'Luxury Hilltop Estate',
    description: 'A magnificent 6-bedroom detached mansion in the exclusive Ibara housing estate, Abeokuta. Built on a hill with breathtaking views of the city, featuring a rock garden, infinity pool, and massive compound space.',
    price: 250000000,
    location: 'Abeokuta, Ogun',
    bedrooms: 6,
    bathrooms: 7,
    areaSqFt: 5000,
    type: PropertyType.ESTATE,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['City Views', 'Rock Garden', 'Infinity Pool', 'Borehole', 'Security House'],
    agent: {
      name: 'James Forge',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 02'
    },
    featured: false
  },
  {
    id: '7',
    title: 'Contemporary Duplex Independence Layout',
    description: 'A masterpiece of contemporary design in the heart of Independence Layout, Enugu. This 5-bedroom duplex features an open floor plan, floor-to-ceiling windows, and smart lighting systems.',
    price: 220000000,
    location: 'Independence Layout, Enugu',
    bedrooms: 5,
    bathrooms: 5,
    areaSqFt: 3800,
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1600596542815-bfad4c1539a9?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Smart Lighting', 'Italian Marble', 'Boys Quarters', 'Carport', 'Tarred Road Access'],
    agent: {
      name: 'Chinedu Okeke',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 04'
    },
    featured: false
  },
  {
    id: '8',
    title: 'Banana Island Waterfront Mansion',
    description: 'An architectural marvel in Nigeria’s most exclusive neighborhood. This waterfront mansion in Banana Island features a private jetty, elevator, glass-enclosed infinity pool, and a 10-car basement garage. Absolute luxury for the ultra-elite.',
    price: 3500000000,
    location: 'Banana Island, Lagos',
    bedrooms: 8,
    bathrooms: 10,
    areaSqFt: 15000,
    type: PropertyType.ESTATE,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Waterfront', 'Private Jetty', 'Basement Garage', 'Elevator', 'Home Automation'],
    agent: {
      name: 'Alexander Forge',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 00'
    },
    featured: false
  },
  {
    id: '9',
    title: 'Ultra-Modern Ikeja GRA Villa',
    description: 'Situated in the serene and secure Ikeja GRA, this newly built 5-bedroom detached villa offers proximity to the airport and mainland business districts. Features include a swimming pool, cinema, and fully fitted dry and wet kitchens.',
    price: 650000000,
    location: 'Ikeja GRA, Lagos',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 5500,
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Cinema', 'Swimming Pool', 'Double Volume Ceiling', '2 Kitchens', 'Ante Room'],
    agent: {
      name: 'Victoria Sterling',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 01'
    },
    featured: false
  },
  {
    id: '10',
    title: 'Guzape Hilltop White House',
    description: 'A striking white mansion sitting atop the hills of Guzape, Abuja. Enjoy panoramic views of the capital city. Features include terraced gardens, a suspended swimming pool, and solar-powered backup electricity.',
    price: 450000000,
    location: 'Guzape, Abuja',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 6000,
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Hilltop View', 'Suspended Pool', 'Solar System', 'Terrace Garden', 'Penthouse Lounge'],
    agent: {
      name: 'James Forge',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 02'
    },
    featured: false
  },
  {
    id: '11',
    title: 'Old GRA Colonial Renovation',
    description: 'A beautiful blend of colonial charm and modern luxury in Old GRA, Port Harcourt. This expansive property sits on 4 plots of land with lush greenery, a renovated 6-bedroom main house, and a separate guest chalet.',
    price: 320000000,
    location: 'Old GRA, Port Harcourt',
    bedrooms: 6,
    bathrooms: 7,
    areaSqFt: 8000,
    type: PropertyType.ESTATE,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Massive Compound', 'Guest Chalet', 'Mature Garden', 'Swimming Pool', 'Generator House'],
    agent: {
      name: 'Chinedu Okeke',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 04'
    },
    featured: false
  },
  {
    id: '12',
    title: 'Ikoyi Luxury Terrace Apartment',
    description: 'High-end 4-bedroom terrace in a serviced mini-estate in Ikoyi. Perfect for expatriates and executives. Facilities include a gym, clubhouse, and 24/7 uniformed security.',
    price: 400000000,
    location: 'Ikoyi, Lagos',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3800,
    type: PropertyType.APARTMENT,
    status: ListingStatus.FOR_SALE,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop'
    ],
    features: ['Serviced Estate', 'Gym', 'Clubhouse', 'Swimming Pool', '24/7 Security'],
    agent: {
      name: 'Sarah Jenkins',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
      phone: '+234 800 FORGE 03'
    },
    featured: false
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Chief Obi',
    email: 'obi.chief@example.com',
    phone: '+234 800 123 4567',
    message: 'Offering 1.4 Billion Naira for the Maitama Mansion. Cash ready. Please arrange a meeting with the principal.',
    propertyId: '2',
    propertyTitle: 'Diplomatic Zone Mansion',
    date: '2025-11-30',
    status: 'Qualified',
    type: 'Offer'
  },
  {
    id: 'l2',
    name: 'Tunde Bakare',
    email: 't.bakare@example.com',
    phone: '+234 800 987 6543',
    message: 'I am interested in the Eko Atlantic Penthouse. Is it still available? I am currently out of the country but can send a representative.',
    propertyId: '4',
    propertyTitle: 'Eko Atlantic Ocean View Penthouse',
    date: '2025-11-29',
    status: 'New',
    type: 'General Inquiry'
  },
  {
    id: 'l3',
    name: 'Amina Yusuf',
    email: 'amina.y@example.com',
    phone: '+234 700 555 4444',
    message: 'I would like to schedule a viewing for the Guzape property next week. Tuesday preferably.',
    propertyId: '10',
    propertyTitle: 'Guzape Hilltop White House',
    date: '2025-11-26',
    status: 'Contacted',
    type: 'Viewing Request'
  },
  {
    id: 'l4',
    name: 'Emeka Okonkwo',
    email: 'e.okonkwo@investments.com',
    phone: '+234 811 222 3333',
    message: 'Looking for investment opportunities in commercial real estate in Lagos. Do you have any off-market listings?',
    date: '2025-11-25',
    status: 'New',
    type: 'General Inquiry'
  }
];
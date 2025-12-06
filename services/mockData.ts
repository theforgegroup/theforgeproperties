import { Lead } from '../types';

// MOCK_PROPERTIES removed. Listings are now fully dynamic from the Admin panel.

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
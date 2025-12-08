export enum PropertyType {
  VILLA = 'Villa',
  APARTMENT = 'Apartment',
  PENTHOUSE = 'Penthouse',
  ESTATE = 'Estate',
  COMMERCIAL = 'Commercial'
}

export enum ListingStatus {
  FOR_SALE = 'For Sale',
  FOR_RENT = 'For Rent',
  SHORT_LET = 'Short Let',
  SOLD = 'Sold'
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  type: PropertyType;
  status: ListingStatus;
  images: string[];
  features: string[];
  agent: {
    name: string;
    image: string;
    phone: string;
  };
  featured?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  date: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Closed';
  type: 'General Inquiry' | 'Viewing Request' | 'Offer';
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface ListingAgent {
  name: string;
  phone: string;
  image: string;
}

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  address: string;
  teamMembers: TeamMember[];
  listingAgent: ListingAgent;
}

export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  type?: PropertyType;
  location?: string;
  searchQuery?: string;
}

export interface AIResponse {
  analysis: string;
  suggestedFilters: FilterCriteria;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
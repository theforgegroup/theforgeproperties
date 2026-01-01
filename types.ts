
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
  slug: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sq_ft: number;
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
  property_id?: string;
  property_title?: string;
  date: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Closed';
  type: 'General Inquiry' | 'Viewing Request' | 'Offer';
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; 
  cover_image: string;
  author: string;
  date: string; 
  category: string;
  status: 'Published' | 'Draft';
  meta_description?: string;
  keyphrase?: string;
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
  contact_email: string; // Updated to snake_case
  contact_phone: string; // Updated to snake_case
  address: string;
  team_members: TeamMember[]; // Updated to snake_case
  listing_agent: ListingAgent; // Updated to snake_case
}

export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  type?: PropertyType;
  location?: string;
  searchQuery?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

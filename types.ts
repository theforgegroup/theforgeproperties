

export enum PropertyType {
  VILLA = 'Villa',
  APARTMENT = 'Apartment',
  PENTHOUSE = 'PENTHOUSE',
  ESTATE = 'Estate',
  COMMERCIAL = 'Commercial'
}

export enum ListingStatus {
  FOR_SALE = 'For Sale',
  FOR_RENT = 'For Rent',
  SHORT_LET = 'Short Let',
  SOLD = 'Sold'
}

// Added TeamMember interface to fix import error in AdminSettings.tsx
export interface TeamMember {
  name: string;
  role: string;
  image: string;
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

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  status: 'Pending' | 'Active' | 'Suspended';
  date_joined: string;
  total_sales: number;
  total_earned: number; // Sum of all approved commissions
  pending_balance: number; // Approved but not yet "Available"
  available_balance: number; // Ready for payout request
  total_paid: number; // Sum of all processed payouts
  total_clicks: number;
  total_leads: number;
  bank_details?: string;
}

export interface AgentSale {
  id: string;
  agent_id: string;
  agent_name: string;
  client_name: string;
  property_id: string;
  property_name: string;
  sale_amount: number;
  deal_status: 'Pending' | 'Under Review' | 'Approved' | 'Paid';
  commission_type: 'Percentage' | 'Fixed';
  commission_percentage?: number;
  commission_amount: number;
  is_available: boolean; // True when admin confirms funds
  date: string;
}

export interface PayoutRequest {
  id: string;
  agent_id: string;
  agent_name: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  date: string;
  payment_reference?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  contact_email: string;
  contact_phone: string;
  address: string;
  team_members: any[];
  listing_agent: any;
  whatsapp_group_link: string;
  min_payout_amount: number;
  default_commission_rate: number;
  show_agent_banner: boolean;
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
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Added FilterCriteria interface to fix import error in Listings.tsx
export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  type?: PropertyType;
  location?: string;
}

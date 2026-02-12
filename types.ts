
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

export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  type?: PropertyType;
  location?: string;
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
  total_commission: number;
  available_balance: number;
  pending_balance: number;
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
  commission_percentage: number;
  commission_amount: number;
  date: string;
}

export interface PayoutRequest {
  id: string;
  agent_id: string;
  agent_name: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
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
  contact_email: string;
  contact_phone: string;
  address: string;
  team_members: TeamMember[];
  listing_agent: ListingAgent;
  whatsapp_group_link: string;
  min_payout_amount: number;
  default_commission_rate: number;
  agent_announcement?: string;
  show_agent_banner: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

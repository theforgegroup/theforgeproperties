

export enum PropertyType {
  LAND = 'Land',
  HOUSE = 'House',
  INVESTMENT = 'Investment',
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

/**
 * Interface for property search filters
 */
export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  type?: PropertyType;
  location?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  image: string;
  description?: string;
  slug: string;
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
  show_on_homepage?: boolean;
  developer?: string;
  plot_sizes?: string[];
  documentation?: string;
  is_coming_soon?: boolean;
  price_options?: { size: string; price: number; formattedPrice: string; }[];
  payment_plan?: string;
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
  location?: string;
  password?: string;
  referred_by_code?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  bio?: string;
  profile_photo?: string;
}

export interface AgentSale {
  id: string;
  agent_id: string;
  client_name: string;
  property_name: string;
  deal_status: 'Pending' | 'Under Review' | 'Approved' | 'Paid';
  commission_amount: number;
  payment_status: 'Unpaid' | 'Paid';
  date: string;
}

export interface PayoutRequest {
  id: string;
  agent_id: string;
  agent_name: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
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
  author?: string;
  date: string; 
  category: string;
  status: 'Published' | 'Draft';
  tags?: string[];
  read_time?: string;
  meta_description?: string;
  keyphrase?: string;
  featured?: boolean;
  show_on_homepage?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface ListingAgent {
  name?: string;
  phone?: string;
  image?: string;
  ai_popup_enabled?: boolean;
  ai_popup_headline?: string;
  ai_popup_body?: string;
  ai_popup_cta?: string;
  ai_floating_button_enabled?: boolean;
}

export interface SiteSettings {
  contact_email: string;
  contact_email_2?: string;
  contact_phone: string;
  address: string;
  team_members: TeamMember[];
  listing_agent: ListingAgent;
  whatsapp_group_link: string;
  min_payout_amount: number;
  logo?: string;
  // Homepage Hero & Visuals
  hero_image?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_badge_text?: string;
  hero_partner_name?: string;
  home_story_image?: string;
  home_cta_image?: string;
  // Homepage Stats Bar
  stat_active_realtors?: string;
  stat_plots_available?: string;
  stat_verified_partners?: string;
  stat_titled_land?: string;
  // Dedicated Page Images & Banners
  about_hero_image?: string;
  about_story_image?: string;
  properties_hero_image?: string;
  contact_hero_image?: string;
  blog_hero_image?: string;
  forge_nation_hero_image?: string;
  join_realtors_hero_image?: string;
  services_hero_image?: string;
  // AI assistant settings
  ai_popup_enabled?: boolean;
  ai_popup_headline?: string;
  ai_popup_body?: string;
  ai_popup_cta?: string;
  ai_floating_button_enabled?: boolean;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_photo?: string;
  testimonial_text: string;
  rating: number; // 1-5
  property_type?: 'Land' | 'House' | 'Investment';
  date?: string;
  show_on_homepage: boolean;
  is_verified?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
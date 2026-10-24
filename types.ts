

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
  status_badge?: 'Available Now' | 'Coming Soon' | 'Sold Out' | string;
  map_url?: string;
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

export type WebinarCallStatus = 
  | 'Not Called'
  | 'Called — Registered'
  | 'Called — Needs Follow Up'
  | 'Called — Call Back Requested'
  | 'Called — Not Interested'
  | 'Called — No Answer'
  | 'Called — Wrong Number';

export interface WebinarLead {
  id: number | string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  call_status: WebinarCallStatus;
  call_notes: string | null;
  called_at: string | null;
  follow_up_date: string | null;
  // WhatsApp Consent & Opt-in Tracking (Default: false)
  whatsapp_opt_in?: boolean;
  whatsapp_opt_in_at?: string | null;
  whatsapp_opt_in_source?: string | null;
  whatsapp_opt_out_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WebinarLeadsStats {
  total: number;
  not_called: number;
  registered: number;
  needs_follow_up: number;
  call_back_requested: number;
  not_interested: number;
  no_answer: number;
  wrong_number: number;
}

export type WhatsAppCampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'processing'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type WhatsAppMessageQueueStatus = 
  | 'pending'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled'
  | 'skipped'
  | 'opted_out'
  | 'uncertain_delivery';

export interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  body_text: string;
  variables: string[];
  example_preview: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  template_name: string;
  template_language: string;
  template_variables?: Record<string, string>;
  status: WhatsAppCampaignStatus;
  created_by: string;
  scheduled_at?: string | null;
  total_recipients: number;
  queued_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  opted_out_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppCampaignMessage {
  id: string;
  campaign_id: string;
  lead_id?: number | string | null;
  recipient_number: string;
  recipient_name: string;
  template_name: string;
  template_variables?: Record<string, string>;
  queue_status: WhatsAppMessageQueueStatus;
  provider_message_id?: string | null;
  attempt_count: number;
  max_attempts: number;
  next_retry_at?: string | null;
  last_error?: string | null;
  idempotency_key: string;
  claim_token?: string | null;
  claimed_at?: string | null;
  claimed_by?: string | null;
  lease_expires_at?: string | null;
  queued_at?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  failed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppOptOut {
  id: string;
  phone_number: string;
  reason?: string | null;
  source: string;
  created_at: string;
}

export interface WhatsAppStats {
  total_campaigns: number;
  draft_campaigns: number;
  queued_campaigns: number;
  processing_campaigns: number;
  completed_campaigns: number;
  total_messages_queued: number;
  total_messages_sent: number;
  total_messages_delivered: number;
  total_messages_read: number;
  total_messages_failed: number;
  total_messages_uncertain?: number;
  total_opt_outs: number;
  delivery_rate: number;
  read_rate: number;
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

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber, BlogPost, Agent, AgentSale, PayoutRequest, Neighborhood, Testimonial } from '../types';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_PROPERTIES } from '../services/defaultProperties';
import { DEFAULT_BLOG_POSTS } from '../services/defaultBlogPosts';

interface Category {
  id: string;
  name: string;
}

interface PropertyContextType {
  properties: Property[];
  leads: Lead[];
  subscribers: Subscriber[];
  posts: BlogPost[];
  categories: Category[];
  agents: Agent[];
  sales: AgentSale[];
  payouts: PayoutRequest[];
  neighborhoods: Neighborhood[];
  testimonials: Testimonial[];
  settings: SiteSettings;
  isLoading: boolean;
  addProperty: (property: Property) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => Property | undefined;
  getPropertyBySlug: (slug: string) => Property | undefined;
  getPost: (id: string) => BlogPost | undefined;
  getPostBySlug: (slug: string) => BlogPost | undefined;
  addLead: (lead: Lead) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  addSubscriber: (email: string) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  addPost: (post: BlogPost) => Promise<void>;
  updatePost: (post: BlogPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  
  // Neighborhood Methods
  addNeighborhood: (neighborhood: Neighborhood) => Promise<void>;
  updateNeighborhood: (neighborhood: Neighborhood) => Promise<void>;
  deleteNeighborhood: (id: string) => Promise<void>;

  // Testimonial Methods
  addTestimonial: (testimonial: Testimonial) => Promise<void>;
  updateTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  
  // Agent Methods
  addAgent: (agent: Partial<Agent>) => Promise<Agent>;
  updateAgent: (agent: Agent) => Promise<void>;
  getAgentSales: (agentId: string) => AgentSale[];
  getAgentPayouts: (agentId: string) => PayoutRequest[];
  requestPayout: (payout: PayoutRequest) => Promise<void>;
  updatePayoutStatus: (id: string, status: PayoutRequest['status']) => Promise<void>;
  addSaleManually: (sale: AgentSale) => Promise<void>;
  updateSaleStatus: (id: string, status: AgentSale['deal_status']) => Promise<void>;
  
  seedDatabase: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'theforgeproperties@gmail.com',
  contact_email_2: 'info@theforgeproperties.com',
  contact_phone: '+234 810 613 3572',
  address: 'Silverland Estate, Sangotedo, Ajah, Lagos, Nigeria',
  team_members: [
    { name: "Daniel Paul", role: "Co-Founder", image: "" },
    { name: "Paul Bolaji", role: "Co-Founder", image: "" },
    { name: "Samuel Oshin", role: "Co-Founder", image: "" }
  ],
  listing_agent: {
    name: "The Forge Properties",
    phone: "+234 810 613 3572",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200"
  },
  whatsapp_group_link: 'https://chat.whatsapp.com/DRsRpTeucuK6bIfSu0pvje?mode=gi_t',
  min_payout_amount: 50000,
  logo: "",
  // Homepage Hero & Visuals Defaults
  hero_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600",
  hero_headline: "Verified, Titled Land in Ogun & Lagos Growth Corridors",
  hero_subheadline: "Own titled land with zero legal risk, transparent documentation, and flexible installment plans tailored for young Nigerians and diaspora investors.",
  hero_badge_text: "Titled Land Only • 100% Surveyed & Verified",
  hero_partner_name: "Geofort Africa",
  // Homepage Stats Bar Defaults
  stat_active_realtors: "50+",
  stat_plots_available: "27",
  stat_verified_partners: "2",
  stat_titled_land: "100%",
  // Dedicated Page Images & Banners
  home_story_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
  home_cta_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000",
  about_hero_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
  about_story_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
  properties_hero_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600",
  contact_hero_image: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=2000",
  blog_hero_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000",
  forge_nation_hero_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000",
  join_realtors_hero_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000",
  services_hero_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
  // AI assistant settings
  ai_popup_enabled: true,
  ai_popup_headline: "Have Questions About Land or Property Investment?",
  ai_popup_body: "Our AI Land Enquiry Assistant can help answer questions about land titles, documentation, land verification, property investment, and buying real estate in Nigeria.",
  ai_popup_cta: "Ask The Forge AI",
  ai_floating_button_enabled: true,
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const cached = localStorage.getItem('forge_site_properties');
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore storage error
    }
    return DEFAULT_PROPERTIES;
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const cached = localStorage.getItem('forge_site_posts');
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore storage error
    }
    return DEFAULT_BLOG_POSTS;
  });
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Market Insights' },
    { id: '2', name: 'Luxury Lifestyle' },
    { id: '3', name: 'Investment' }
  ]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sales, setSales] = useState<AgentSale[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('forge_site_settings');
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore storage error
    }
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch settings first or in parallel to prioritize logo
      const [
        { data: propsData },
        { data: leadsData },
        { data: subsData },
        { data: postsData },
        { data: catsData },
        agentsList,
        { data: salesData },
        { data: payoutsData },
        { data: neighborhoodsData },
        { data: testimonialsData },
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('leads').select('*').order('date', { ascending: false }),
        supabase.from('subscribers').select('*'),
        supabase.from('posts').select('*').order('date', { ascending: false }),
        supabase.from('blog_categories').select('*'),
        fetch('/api/agents').then(res => res.ok ? res.json() : []).catch(err => { console.error('Error fetching agents:', err); return []; }),
        supabase.from('agent_sales').select('*'),
        supabase.from('payout_requests').select('*'),
        supabase.from('neighborhoods').select('*'),
        supabase.from('testimonials').select('*'),
        supabase.from('site_settings').select('*').eq('id', 1).single()
      ]);

      if (propsData && propsData.length > 0) {
        setProperties(propsData);
        try {
          localStorage.setItem('forge_site_properties', JSON.stringify(propsData));
        } catch {
          // Ignore local storage error
        }
      } else {
        setProperties(DEFAULT_PROPERTIES);
      }

      if (leadsData) setLeads(leadsData);
      if (subsData) setSubscribers(subsData);

      if (postsData && postsData.length > 0) {
        setPosts(postsData);
        try {
          localStorage.setItem('forge_site_posts', JSON.stringify(postsData));
        } catch {
          // Ignore local storage error
        }
      } else {
        setPosts(DEFAULT_BLOG_POSTS);
      }

      if (catsData && catsData.length > 0) setCategories(catsData);
      if (agentsList) setAgents(agentsList);
      if (salesData) setSales(salesData);
      if (payoutsData) setPayouts(payoutsData);
      if (neighborhoodsData) setNeighborhoods(neighborhoodsData);
      if (testimonialsData) setTestimonials(testimonialsData);

      if (settingsData) {
        let contact_email = settingsData.contact_email || '';
        let contact_email_2 = '';
        if (contact_email.includes(';')) {
          const parts = contact_email.split(';');
          contact_email = parts[0]?.trim() || '';
          contact_email_2 = parts[1]?.trim() || '';
        }

        // Unpack virtual & page settings from listing_agent jsonb
        const {
          ai_popup_enabled = DEFAULT_SETTINGS.ai_popup_enabled,
          ai_popup_headline = DEFAULT_SETTINGS.ai_popup_headline,
          ai_popup_body = DEFAULT_SETTINGS.ai_popup_body,
          ai_popup_cta = DEFAULT_SETTINGS.ai_popup_cta,
          ai_floating_button_enabled = DEFAULT_SETTINGS.ai_floating_button_enabled,
          hero_image = DEFAULT_SETTINGS.hero_image,
          hero_headline = DEFAULT_SETTINGS.hero_headline,
          hero_subheadline = DEFAULT_SETTINGS.hero_subheadline,
          hero_badge_text = DEFAULT_SETTINGS.hero_badge_text,
          hero_partner_name = DEFAULT_SETTINGS.hero_partner_name,
          home_story_image = DEFAULT_SETTINGS.home_story_image,
          home_cta_image = DEFAULT_SETTINGS.home_cta_image,
          stat_active_realtors = DEFAULT_SETTINGS.stat_active_realtors,
          stat_plots_available = DEFAULT_SETTINGS.stat_plots_available,
          stat_verified_partners = DEFAULT_SETTINGS.stat_verified_partners,
          stat_titled_land = DEFAULT_SETTINGS.stat_titled_land,
          about_hero_image = DEFAULT_SETTINGS.about_hero_image,
          about_story_image = DEFAULT_SETTINGS.about_story_image,
          properties_hero_image = DEFAULT_SETTINGS.properties_hero_image,
          contact_hero_image = DEFAULT_SETTINGS.contact_hero_image,
          blog_hero_image = DEFAULT_SETTINGS.blog_hero_image,
          forge_nation_hero_image = DEFAULT_SETTINGS.forge_nation_hero_image,
          join_realtors_hero_image = DEFAULT_SETTINGS.join_realtors_hero_image,
          services_hero_image = DEFAULT_SETTINGS.services_hero_image,
          ...cleanListingAgent
        } = settingsData.listing_agent || {};

        const mergedSettings: SiteSettings = {
          ...DEFAULT_SETTINGS,
          ...settingsData,
          contact_email,
          contact_email_2,
          listing_agent: cleanListingAgent,
          hero_image,
          hero_headline,
          hero_subheadline,
          hero_badge_text,
          hero_partner_name,
          home_story_image,
          home_cta_image,
          stat_active_realtors,
          stat_plots_available,
          stat_verified_partners,
          stat_titled_land,
          about_hero_image,
          about_story_image,
          properties_hero_image,
          contact_hero_image,
          blog_hero_image,
          forge_nation_hero_image,
          join_realtors_hero_image,
          services_hero_image,
          ai_popup_enabled,
          ai_popup_headline,
          ai_popup_body,
          ai_popup_cta,
          ai_floating_button_enabled
        };

        setSettings(mergedSettings);
        try {
          localStorage.setItem('forge_site_settings', JSON.stringify(mergedSettings));
        } catch {
          // Ignore local storage error
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Background polling fallback every 10s to guarantee sync across admin and frontend tabs/devices
    const pollInterval = setInterval(() => {
      fetchData();
    }, 10000);

    // Setup live subscription to database updates
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchData();
      })
      .subscribe();

    // Auto-refresh data when user switches back to tab or on window focus
    const handleSync = () => {
      fetchData();
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchData();
    });
    window.addEventListener('forge_settings_updated', handleSync);
    window.addEventListener('forge_properties_updated', handleSync);
    window.addEventListener('forge_posts_updated', handleSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'forge_settings_updated' || e.key === 'forge_properties_updated' || e.key === 'forge_posts_updated') {
        fetchData();
      }
    });

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('forge_settings_updated', handleSync);
      window.removeEventListener('forge_properties_updated', handleSync);
      window.removeEventListener('forge_posts_updated', handleSync);
    };
  }, []);

  const addNeighborhood = async (neighborhood: Neighborhood) => {
    const { error } = await supabase.from('neighborhoods').insert([neighborhood]);
    if (error) throw error;
    setNeighborhoods(prev => [neighborhood, ...prev]);
  };

  const updateNeighborhood = async (updatedNeighborhood: Neighborhood) => {
    const { error } = await supabase.from('neighborhoods').update(updatedNeighborhood).eq('id', updatedNeighborhood.id);
    if (error) throw error;
    setNeighborhoods(prev => prev.map(n => n.id === updatedNeighborhood.id ? updatedNeighborhood : n));
  };

  const deleteNeighborhood = async (id: string) => {
    const { error } = await supabase.from('neighborhoods').delete().eq('id', id);
    if (error) throw error;
    setNeighborhoods(prev => prev.filter(n => n.id !== id));
  };

  const addTestimonial = async (testimonial: Testimonial) => {
    const { error } = await supabase.from('testimonials').insert([testimonial]);
    if (error) throw error;
    setTestimonials(prev => [testimonial, ...prev]);
  };

  const updateTestimonial = async (updatedTestimonial: Testimonial) => {
    const { error } = await supabase.from('testimonials').update(updatedTestimonial).eq('id', updatedTestimonial.id);
    if (error) throw error;
    setTestimonials(prev => prev.map(t => t.id === updatedTestimonial.id ? updatedTestimonial : t));
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = async (name: string): Promise<Category> => {
    const newCat = { id: Date.now().toString(), name };
    const { data, error } = await supabase.from('blog_categories').insert([newCat]).select().single();
    if (error) {
      setCategories(prev => [...prev, newCat]);
      return newCat;
    }
    setCategories(prev => [...prev, data]);
    return data;
  };

  const addAgent = async (agent: Partial<Agent>): Promise<Agent> => {
    const newAgent = {
      ...agent,
      id: Date.now().toString(),
      referral_code: `FORGE${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'Pending',
      date_joined: new Date().toISOString(),
      total_sales: 0,
      total_commission: 0,
      available_balance: 0,
      pending_balance: 0,
      total_clicks: 0,
      total_leads: 0
    } as Agent;
    
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
    } catch (err) {
      console.error('Error adding agent:', err);
    }
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = async (agent: Agent) => {
    try {
      await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });
    } catch (err) {
      console.error('Error updating agent:', err);
    }
    setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
  };

  const getAgentSales = (agentId: string) => sales.filter(s => s.agent_id === agentId);
  const getAgentPayouts = (agentId: string) => payouts.filter(p => p.agent_id === agentId);

  const requestPayout = async (payout: PayoutRequest) => {
    const { error } = await supabase.from('payout_requests').insert([payout]);
    if (error) throw error;
    setPayouts(prev => [payout, ...prev]);
  };

  const updatePayoutStatus = async (id: string, status: PayoutRequest['status']) => {
    const { error } = await supabase.from('payout_requests').update({ status }).eq('id', id);
    if (error) throw error;
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const addSaleManually = async (sale: AgentSale) => {
    const { error } = await supabase.from('agent_sales').insert([sale]);
    if (error) throw error;
    setSales(prev => [sale, ...prev]);
  };

  const updateSaleStatus = async (id: string, status: AgentSale['deal_status']) => {
    const { error } = await supabase.from('agent_sales').update({ deal_status: status }).eq('id', id);
    if (error) throw error;
    setSales(prev => prev.map(s => s.id === id ? { ...s, deal_status: status } : s));
  };

  const addProperty = async (property: Property) => {
    let { error } = await supabase.from('properties').insert([property]);
    if (error && error.message && error.message.includes("'developer' column")) {
      const rest = { ...property };
      delete (rest as Record<string, unknown>).developer;
      const fallback = await supabase.from('properties').insert([rest]);
      error = fallback.error;
    }
    if (error) throw error;
    setProperties(prev => {
      const updated = [property, ...prev];
      try {
        localStorage.setItem('forge_site_properties', JSON.stringify(updated));
        localStorage.setItem('forge_properties_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_properties_updated'));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const updateProperty = async (updatedProperty: Property) => {
    let { error } = await supabase.from('properties').update(updatedProperty).eq('id', updatedProperty.id);
    if (error && error.message && error.message.includes("'developer' column")) {
      const rest = { ...updatedProperty };
      delete (rest as Record<string, unknown>).developer;
      const fallback = await supabase.from('properties').update(rest).eq('id', updatedProperty.id);
      error = fallback.error;
    }
    if (error) throw error;
    setProperties(prev => {
      const updated = prev.map(p => p.id === updatedProperty.id ? updatedProperty : p);
      try {
        localStorage.setItem('forge_site_properties', JSON.stringify(updated));
        localStorage.setItem('forge_properties_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_properties_updated'));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    setProperties(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('forge_site_properties', JSON.stringify(updated));
        localStorage.setItem('forge_properties_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_properties_updated'));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const addLead = async (lead: Lead) => {
    const { error } = await supabase.from('leads').insert([lead]);
    if (error) throw error;
    setLeads(prev => [lead, ...prev]);
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) throw error;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const addSubscriber = async (email: string) => {
    if (subscribers.some(s => s.email === email)) return;
    const newSubscriber: Subscriber = { id: Date.now().toString(), email, date: new Date().toISOString() };
    const { error } = await supabase.from('subscribers').insert([newSubscriber]);
    if (error) throw error;
    setSubscribers(prev => [newSubscriber, ...prev]);
  };

  const getPost = (id: string) => posts.find(p => p.id === id || p.slug === id);
  const getPostBySlug = (slug: string) => posts.find(p => p.slug === slug || p.id === slug);
  const getProperty = (id: string) => properties.find(p => p.id === id || p.slug === id);
  const getPropertyBySlug = (slug: string) => properties.find(p => p.slug === slug || p.id === slug);

  const addPost = async (post: BlogPost) => {
    // Ensure slug is clean before sending
    const cleanPost = {
      ...post,
      slug: post.slug || post.id // fallback but ideally generated in form
    };
    const { error } = await supabase.from('posts').insert([cleanPost]);
    if (error) {
      console.error('Supabase addPost error:', error);
      throw error;
    }
    setPosts(prev => {
      const updated = [cleanPost, ...prev];
      try {
        localStorage.setItem('forge_site_posts', JSON.stringify(updated));
        localStorage.setItem('forge_posts_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_posts_updated'));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const updatePost = async (updatedPost: BlogPost) => {
    const { error } = await supabase.from('posts').update(updatedPost).eq('id', updatedPost.id);
    if (error) {
      console.error('Supabase updatePost error:', error);
      throw error;
    }
    setPosts(prev => {
      const updated = prev.map(p => p.id === updatedPost.id ? updatedPost : p);
      try {
        localStorage.setItem('forge_site_posts', JSON.stringify(updated));
        localStorage.setItem('forge_posts_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_posts_updated'));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('forge_site_posts', JSON.stringify(updated));
        localStorage.setItem('forge_posts_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_posts_updated'));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    // 1. Instantly update React state and LocalStorage so the frontend immediately reflects changes
    setSettings(newSettings);
    try {
      localStorage.setItem('forge_site_settings', JSON.stringify(newSettings));
      localStorage.setItem('forge_settings_updated', Date.now().toString());
      window.dispatchEvent(new Event('forge_settings_updated'));
    } catch {
      // Ignore local storage error
    }

    try {
      const { contact_email_2, ...payload } = newSettings;
      const dbPayload: Record<string, unknown> = { ...payload };

      // Pack custom imagery, hero, metric, and AI settings into listing_agent jsonb object for database storage
      dbPayload.listing_agent = {
        ...(newSettings.listing_agent || {}),
        ai_popup_enabled: newSettings.ai_popup_enabled,
        ai_popup_headline: newSettings.ai_popup_headline,
        ai_popup_body: newSettings.ai_popup_body,
        ai_popup_cta: newSettings.ai_popup_cta,
        ai_floating_button_enabled: newSettings.ai_floating_button_enabled,
        hero_image: newSettings.hero_image,
        hero_headline: newSettings.hero_headline,
        hero_subheadline: newSettings.hero_subheadline,
        hero_badge_text: newSettings.hero_badge_text,
        hero_partner_name: newSettings.hero_partner_name,
        home_story_image: newSettings.home_story_image,
        home_cta_image: newSettings.home_cta_image,
        stat_active_realtors: newSettings.stat_active_realtors,
        stat_plots_available: newSettings.stat_plots_available,
        stat_verified_partners: newSettings.stat_verified_partners,
        stat_titled_land: newSettings.stat_titled_land,
        about_hero_image: newSettings.about_hero_image,
        about_story_image: newSettings.about_story_image,
        properties_hero_image: newSettings.properties_hero_image,
        contact_hero_image: newSettings.contact_hero_image,
        blog_hero_image: newSettings.blog_hero_image,
        forge_nation_hero_image: newSettings.forge_nation_hero_image,
        join_realtors_hero_image: newSettings.join_realtors_hero_image,
        services_hero_image: newSettings.services_hero_image,
      };

      // Delete non-column fields from dbPayload root so Postgres doesn't reject them
      const virtualFields = [
        'ai_popup_enabled', 'ai_popup_headline', 'ai_popup_body', 'ai_popup_cta', 'ai_floating_button_enabled',
        'hero_image', 'hero_headline', 'hero_subheadline', 'hero_badge_text', 'hero_partner_name',
        'home_story_image', 'home_cta_image',
        'stat_active_realtors', 'stat_plots_available', 'stat_verified_partners', 'stat_titled_land',
        'about_hero_image', 'about_story_image', 'properties_hero_image', 'contact_hero_image',
        'blog_hero_image', 'forge_nation_hero_image', 'join_realtors_hero_image', 'services_hero_image'
      ];
      virtualFields.forEach(f => delete dbPayload[f]);
      
      if (contact_email_2 && contact_email_2.trim()) {
        dbPayload.contact_email = `${newSettings.contact_email || ''};${contact_email_2.trim()}`;
      }

      dbPayload.updated_at = new Date().toISOString();

      const { error } = await supabase.from('site_settings').upsert({ id: 1, ...dbPayload });
      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }

      // Broadcast update again on DB confirmation
      try {
        localStorage.setItem('forge_settings_updated', Date.now().toString());
        window.dispatchEvent(new Event('forge_settings_updated'));
      } catch {
        // Ignore local storage error
      }
    } catch (err) {
      console.error('updateSettings failed:', err);
      throw err;
    }
  };

  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      const { contact_email_2, ...seedPayload } = DEFAULT_SETTINGS;
      const dbPayload: Partial<SiteSettings> & { id?: number } = { ...seedPayload };
      
      if (contact_email_2 && contact_email_2.trim()) {
        dbPayload.contact_email = `${DEFAULT_SETTINGS.contact_email || ''};${contact_email_2.trim()}`;
      }

      await supabase.from('site_settings').upsert({ id: 1, ...dbPayload });
      
      await fetchData();
      alert("System initialized with clean site settings.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts, categories, agents, sales, payouts, settings, neighborhoods, testimonials, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty, getPropertyBySlug,
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addPost, updatePost, deletePost, getPost, getPostBySlug,
      addCategory,
      addNeighborhood, updateNeighborhood, deleteNeighborhood,
      addTestimonial, updateTestimonial, deleteTestimonial,
      addAgent, updateAgent, getAgentSales, getAgentPayouts, requestPayout, updatePayoutStatus, addSaleManually, updateSaleStatus,
      seedDatabase,
      refreshData: fetchData
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('useProperties must be used within a PropertyProvider');
  return context;
};


/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber, BlogPost, Agent, AgentSale, PayoutRequest, Neighborhood, Testimonial } from '../types';
import { supabase } from '../lib/supabaseClient';

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
  addLead: (lead: Lead) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  addSubscriber: (email: string) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  addPost: (post: BlogPost) => Promise<void>;
  updatePost: (post: BlogPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPost: (id: string) => BlogPost | undefined;
  getPostBySlug: (slug: string) => BlogPost | undefined;
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
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'theforgeproperties@gmail.com',
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
  logo: ""
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
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
        { data: agentsData },
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
        supabase.from('agents').select('*'),
        supabase.from('agent_sales').select('*'),
        supabase.from('payout_requests').select('*'),
        supabase.from('neighborhoods').select('*'),
        supabase.from('testimonials').select('*'),
        supabase.from('site_settings').select('*').eq('id', 1).single()
      ]);

      if (propsData) setProperties(propsData);
      if (leadsData) setLeads(leadsData);
      if (subsData) setSubscribers(subsData);
      if (postsData) setPosts(postsData);
      if (catsData && catsData.length > 0) setCategories(catsData);
      if (agentsData) setAgents(agentsData);
      if (salesData) setSales(salesData);
      if (payoutsData) setPayouts(payoutsData);
      if (neighborhoodsData) setNeighborhoods(neighborhoodsData);
      if (testimonialsData) setTestimonials(testimonialsData);
      if (settingsData) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    
    const { error } = await supabase.from('agents').insert([newAgent]);
    if (error) {
      setAgents(prev => [...prev, newAgent]);
      return newAgent;
    }
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = async (agent: Agent) => {
    await supabase.from('agents').update(agent).eq('id', agent.id);
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
    const { error } = await supabase.from('properties').insert([property]);
    if (error) throw error;
    setProperties(prev => [property, ...prev]);
  };

  const updateProperty = async (updatedProperty: Property) => {
    const { error } = await supabase.from('properties').update(updatedProperty).eq('id', updatedProperty.id);
    if (error) throw error;
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    setProperties(prev => prev.filter(p => p.id !== id));
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

  const addPost = async (post: BlogPost) => {
    const { error } = await supabase.from('posts').insert([post]);
    if (error) throw error;
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = async (updatedPost: BlogPost) => {
    const { error } = await supabase.from('posts').update(updatedPost).eq('id', updatedPost.id);
    if (error) throw error;
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    try {
      const { error } = await supabase.from('site_settings').upsert({ id: 1, ...newSettings });
      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }
      setSettings(newSettings);
    } catch (err) {
      console.error('updateSettings failed:', err);
      throw err;
    }
  };

  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      await supabase.from('site_settings').upsert({ id: 1, ...DEFAULT_SETTINGS });
      
      const demoTestimonials: Testimonial[] = [
        {
          id: 'demo-1',
          client_name: "Olawale Adeyemi",
          testimonial_text: "The Forge Properties made my land acquisition in Ibeju-Lekki so seamless. Their transparency and documentation verification gave me total peace of mind.",
          rating: 5,
          property_type: 'Land',
          show_on_homepage: true,
          is_verified: true,
          date: new Date().toISOString()
        },
        {
          id: 'demo-2',
          client_name: "Chidinma Okoro",
          testimonial_text: "I found my dream home in Ajah through their platform. The AI search was surprisingly accurate, and the team was professional throughout the process.",
          rating: 5,
          property_type: 'House',
          show_on_homepage: true,
          is_verified: true,
          date: new Date().toISOString()
        },
        {
          id: 'demo-3',
          client_name: "Tunde Bakare",
          testimonial_text: "Excellent service. They don't just sell; they guide you on the best investment strategies. Highly recommended for anyone looking for verified properties.",
          rating: 5,
          property_type: 'Investment',
          show_on_homepage: true,
          is_verified: true,
          date: new Date().toISOString()
        }
      ];

      await supabase.from('testimonials').upsert(demoTestimonials);
      
      await fetchData();
      alert("System initialized with demo data.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts, categories, agents, sales, payouts, settings, neighborhoods, testimonials, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty: (id) => properties.find(p => p.id === id), getPropertyBySlug: (slug) => properties.find(p => p.slug === slug),
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addPost, updatePost, deletePost, getPost: (id) => posts.find(p => p.id === id), getPostBySlug: (slug) => posts.find(p => p.slug === slug),
      addCategory,
      addNeighborhood, updateNeighborhood, deleteNeighborhood,
      addTestimonial, updateTestimonial, deleteTestimonial,
      addAgent, updateAgent, getAgentSales, getAgentPayouts, requestPayout, updatePayoutStatus, addSaleManually, updateSaleStatus,
      seedDatabase
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


import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber, BlogPost, Agent, AgentSale, PayoutRequest } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PropertyContextType {
  properties: Property[];
  leads: Lead[];
  subscribers: Subscriber[];
  posts: BlogPost[];
  agents: Agent[];
  sales: AgentSale[];
  payouts: PayoutRequest[];
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
  whatsapp_group_link: 'https://chat.whatsapp.com/TheForgeAgentsOfficial',
  min_payout_amount: 50000
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sales, setSales] = useState<AgentSale[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: propsData } = await supabase.from('properties').select('*').order('id', { ascending: false });
      if (propsData) setProperties(propsData);

      const { data: leadsData } = await supabase.from('leads').select('*').order('date', { ascending: false });
      if (leadsData) setLeads(leadsData);

      const { data: subsData } = await supabase.from('subscribers').select('*');
      if (subsData) setSubscribers(subsData);

      const { data: postsData } = await supabase.from('posts').select('*').order('date', { ascending: false });
      if (postsData) setPosts(postsData);

      const { data: agentsData } = await supabase.from('agents').select('*');
      if (agentsData) setAgents(agentsData);

      const { data: salesData } = await supabase.from('agent_sales').select('*');
      if (salesData) setSales(salesData);

      const { data: payoutsData } = await supabase.from('payout_requests').select('*');
      if (payoutsData) setPayouts(payoutsData);

      const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
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
    await supabase.from('payout_requests').insert([payout]);
    setPayouts(prev => [payout, ...prev]);
  };

  const updatePayoutStatus = async (id: string, status: PayoutRequest['status']) => {
    await supabase.from('payout_requests').update({ status }).eq('id', id);
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const addSaleManually = async (sale: AgentSale) => {
    await supabase.from('agent_sales').insert([sale]);
    setSales(prev => [sale, ...prev]);
  };

  const updateSaleStatus = async (id: string, status: AgentSale['deal_status']) => {
    await supabase.from('agent_sales').update({ deal_status: status }).eq('id', id);
    setSales(prev => prev.map(s => s.id === id ? { ...s, deal_status: status } : s));
  };

  const addProperty = async (property: Property) => {
    await supabase.from('properties').insert([property]);
    setProperties(prev => [property, ...prev]);
  };

  const updateProperty = async (updatedProperty: Property) => {
    await supabase.from('properties').update(updatedProperty).eq('id', updatedProperty.id);
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = async (id: string) => {
    await supabase.from('properties').delete().eq('id', id);
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const addLead = async (lead: Lead) => {
    await supabase.from('leads').insert([lead]);
    setLeads(prev => [lead, ...prev]);
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const addSubscriber = async (email: string) => {
    if (subscribers.some(s => s.email === email)) return;
    const newSubscriber: Subscriber = { id: Date.now().toString(), email, date: new Date().toISOString() };
    await supabase.from('subscribers').insert([newSubscriber]);
    setSubscribers(prev => [newSubscriber, ...prev]);
  };

  const addPost = async (post: BlogPost) => {
    await supabase.from('posts').insert([post]);
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = async (updatedPost: BlogPost) => {
    await supabase.from('posts').update(updatedPost).eq('id', updatedPost.id);
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    await supabase.from('site_settings').update(newSettings).eq('id', 1);
    setSettings(newSettings);
  };

  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      await supabase.from('site_settings').upsert({ id: 1, ...DEFAULT_SETTINGS });
      await fetchData();
      alert("System initialized.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts, agents, sales, payouts, settings, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty: (id) => properties.find(p => p.id === id), getPropertyBySlug: (slug) => properties.find(p => p.slug === slug),
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addPost, updatePost, deletePost, getPost: (id) => posts.find(p => p.id === id), getPostBySlug: (slug) => posts.find(p => p.slug === slug),
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

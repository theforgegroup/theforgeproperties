
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber, BlogPost, Agent, AgentSale, PayoutRequest, AuditLog } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PropertyContextType {
  properties: Property[];
  leads: Lead[];
  subscribers: Subscriber[];
  posts: BlogPost[];
  agents: Agent[];
  sales: AgentSale[];
  payouts: PayoutRequest[];
  auditLogs: AuditLog[];
  settings: SiteSettings;
  isLoading: boolean;
  
  // Existing Methods
  addProperty: (property: Property) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => Property | undefined;
  addLead: (lead: Lead) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  addSubscriber: (email: string) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  
  // Agent Methods
  addAgent: (agent: Partial<Agent>) => Promise<Agent>;
  updateAgent: (agent: Agent) => Promise<void>;
  adjustAgentWallet: (agentId: string, amount: number, reason: string) => Promise<void>;
  
  // Sales & Deals
  addSale: (sale: AgentSale) => Promise<void>;
  updateSaleStatus: (saleId: string, status: AgentSale['deal_status']) => Promise<void>;
  
  // Payouts
  requestPayout: (payout: PayoutRequest) => Promise<void>;
  processPayout: (payoutId: string, status: 'Approved' | 'Rejected', reference?: string) => Promise<void>;
  
  seedDatabase: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'theforgeproperties@gmail.com',
  contact_phone: '+234 810 613 3572',
  address: 'Silverland Estate, Sangotedo, Ajah, Lagos, Nigeria',
  team_members: [],
  listing_agent: { name: "", phone: "", image: "" },
  whatsapp_group_link: 'https://chat.whatsapp.com/TheForgeAgentsOfficial',
  min_payout_amount: 50000,
  default_commission_rate: 5,
  show_agent_banner: true
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sales, setSales] = useState<AgentSale[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: props } = await supabase.from('properties').select('*');
      if (props) setProperties(props);

      const { data: lds } = await supabase.from('leads').select('*');
      if (lds) setLeads(lds);

      const { data: ags } = await supabase.from('agents').select('*');
      if (ags) setAgents(ags);

      const { data: sls } = await supabase.from('agent_sales').select('*');
      if (sls) setSales(sls);

      const { data: pay } = await supabase.from('payout_requests').select('*');
      if (pay) setPayouts(pay);

      const { data: sets } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (sets) setSettings({ ...DEFAULT_SETTINGS, ...sets });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const logAction = async (action: string, target_id: string, details: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      action,
      performed_by: 'Corporate Admin',
      target_id,
      details,
      timestamp: new Date().toISOString()
    };
    await supabase.from('audit_logs').insert([log]);
    setAuditLogs(prev => [log, ...prev]);
  };

  const addSale = async (sale: AgentSale) => {
    await supabase.from('agent_sales').insert([sale]);
    setSales(prev => [sale, ...prev]);
    await logAction('New Sale Created', sale.agent_id, `Property: ${sale.property_name}, Amount: ${sale.sale_amount}`);
  };

  const updateSaleStatus = async (saleId: string, status: AgentSale['deal_status']) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    await supabase.from('agent_sales').update({ deal_status: status }).eq('id', saleId);
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, deal_status: status } : s));

    // Wallet logic: If approved, add to pending or available
    if (status === 'Approved') {
      const agent = agents.find(a => a.id === sale.agent_id);
      if (agent) {
        const updatedAgent = {
          ...agent,
          available_balance: agent.available_balance + sale.commission_amount,
          total_commission: agent.total_commission + sale.commission_amount,
          total_sales: agent.total_sales + 1
        };
        await updateAgent(updatedAgent);
        await logAction('Wallet Credit (Sale)', sale.agent_id, `Earned ₦${sale.commission_amount} from ${sale.property_name}`);
      }
    }
  };

  const adjustAgentWallet = async (agentId: string, amount: number, reason: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const updatedAgent = { ...agent, available_balance: agent.available_balance + amount };
    await updateAgent(updatedAgent);
    await logAction('Manual Wallet Adjustment', agentId, `${amount > 0 ? 'Added' : 'Deducted'} ₦${Math.abs(amount)}. Reason: ${reason}`);
  };

  const processPayout = async (payoutId: string, status: 'Approved' | 'Rejected', reference?: string) => {
    const payout = payouts.find(p => p.id === payoutId);
    if (!payout) return;

    await supabase.from('payout_requests').update({ status, payment_reference: reference }).eq('id', payoutId);
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status, payment_reference: reference } : p));

    if (status === 'Approved') {
      const agent = agents.find(a => a.id === payout.agent_id);
      if (agent) {
        const updatedAgent = { ...agent, available_balance: agent.available_balance - payout.amount };
        await updateAgent(updatedAgent);
        await logAction('Payout Authorized', payout.agent_id, `Amount: ₦${payout.amount}. Ref: ${reference || 'N/A'}`);
      }
    }
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
    await supabase.from('agents').insert([newAgent]);
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = async (agent: Agent) => {
    await supabase.from('agents').update(agent).eq('id', agent.id);
    setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
  };

  // Rest of standard methods...
  const addProperty = async (property: Property) => { await supabase.from('properties').insert([property]); setProperties(prev => [property, ...prev]); };
  const updateProperty = async (p: Property) => { await supabase.from('properties').update(p).eq('id', p.id); setProperties(prev => prev.map(old => old.id === p.id ? p : old)); };
  const deleteProperty = async (id: string) => { await supabase.from('properties').delete().eq('id', id); setProperties(prev => prev.filter(p => p.id !== id)); };
  const addLead = async (lead: Lead) => { await supabase.from('leads').insert([lead]); setLeads(prev => [lead, ...prev]); };
  const updateLeadStatus = async (id: string, status: Lead['status']) => { await supabase.from('leads').update({ status }).eq('id', id); setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l)); };
  const addSubscriber = async (email: string) => { const sub = { id: Date.now().toString(), email, date: new Date().toISOString() }; await supabase.from('subscribers').insert([sub]); setSubscribers(prev => [sub, ...prev]); };
  const updateSettings = async (s: SiteSettings) => { await supabase.from('site_settings').update(s).eq('id', 1); setSettings(s); };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts, agents, sales, payouts, auditLogs, settings, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty: (id) => properties.find(p => p.id === id),
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addAgent, updateAgent, adjustAgentWallet, addSale, updateSaleStatus, requestPayout: async(p) => { await supabase.from('payout_requests').insert([p]); setPayouts(prev => [p, ...prev]); }, processPayout,
      seedDatabase: async () => { await supabase.from('site_settings').upsert({ id: 1, ...DEFAULT_SETTINGS }); fetchData(); }
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => { const context = useContext(PropertyContext); if (!context) throw new Error('useProperties error'); return context; };


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
  
  addProperty: (property: Property) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => Property | undefined;
  addLead: (lead: Lead) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  addSubscriber: (email: string) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  
  // Agent & Wallet Logic
  addAgent: (agent: Partial<Agent>) => Promise<Agent>;
  updateAgent: (agent: Agent) => Promise<void>;
  addSale: (sale: AgentSale) => Promise<void>;
  updateSaleStatus: (saleId: string, status: AgentSale['deal_status']) => Promise<void>;
  makeCommissionAvailable: (saleId: string) => Promise<void>;
  
  // Payout Logic
  requestPayout: (payout: PayoutRequest) => Promise<void>;
  processPayout: (payoutId: string, status: PayoutRequest['status'], reference?: string) => Promise<void>;
  
  seedDatabase: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'theforgeproperties@gmail.com',
  contact_phone: '+234 810 613 3572',
  address: 'Silverland Estate, Sangotedo, Ajah, Lagos, Nigeria',
  team_members: [],
  listing_agent: { name: "The Forge Properties", phone: "+234 810 613 3572", image: "" },
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
      const { data: sls } = await supabase.from('agent_sales').select('*');
      if (sls) setSales(sls);
      const { data: ags } = await supabase.from('agents').select('*');
      if (ags) setAgents(ags);
      const { data: pay } = await supabase.from('payout_requests').select('*');
      if (pay) setPayouts(pay);
      const { data: sets } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (sets) setSettings({ ...DEFAULT_SETTINGS, ...sets });
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const logAudit = async (action: string, agent_id: string, details: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      action,
      performed_by: 'Corporate Admin',
      target_id: agent_id,
      details,
      timestamp: new Date().toISOString()
    };
    await supabase.from('audit_logs').insert([log]);
    setAuditLogs(prev => [log, ...prev]);
  };

  const addSale = async (sale: AgentSale) => {
    await supabase.from('agent_sales').insert([sale]);
    setSales(prev => [sale, ...prev]);
    await logAudit('Deal Recorded', sale.agent_id, `Property: ${sale.property_name}, Amount: ${sale.sale_amount}`);
  };

  const updateSaleStatus = async (saleId: string, status: AgentSale['deal_status']) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    await supabase.from('agent_sales').update({ deal_status: status }).eq('id', saleId);
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, deal_status: status } : s));

    if (status === 'Approved') {
      const agent = agents.find(a => a.id === sale.agent_id);
      if (agent) {
        const updatedAgent = {
          ...agent,
          pending_balance: (agent.pending_balance || 0) + sale.commission_amount,
          total_earned: (agent.total_earned || 0) + sale.commission_amount,
          total_sales: (agent.total_sales || 0) + 1
        };
        await updateAgent(updatedAgent);
        await logAudit('Commission Approved (Pending)', agent.id, `₦${sale.commission_amount.toLocaleString()} added to pending.`);
      }
    }
  };

  const makeCommissionAvailable = async (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.is_available) return;

    await supabase.from('agent_sales').update({ is_available: true }).eq('id', saleId);
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, is_available: true } : s));

    const agent = agents.find(a => a.id === sale.agent_id);
    if (agent) {
      const updatedAgent = {
        ...agent,
        available_balance: (agent.available_balance || 0) + sale.commission_amount,
        pending_balance: (agent.pending_balance || 0) - sale.commission_amount
      };
      await updateAgent(updatedAgent);
      await logAudit('Funds Verified (Available)', agent.id, `₦${sale.commission_amount.toLocaleString()} moved to available balance.`);
    }
  };

  const processPayout = async (payoutId: string, status: PayoutRequest['status'], reference?: string) => {
    const payout = payouts.find(p => p.id === payoutId);
    if (!payout) return;

    await supabase.from('payout_requests').update({ status, payment_reference: reference }).eq('id', payoutId);
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status, payment_reference: reference } : p));

    if (status === 'Paid') {
      const agent = agents.find(a => a.id === payout.agent_id);
      if (agent) {
        const updatedAgent = {
          ...agent,
          available_balance: (agent.available_balance || 0) - payout.amount,
          total_paid: (agent.total_paid || 0) + payout.amount
        };
        await updateAgent(updatedAgent);
        await logAudit('Payout Processed', agent.id, `₦${payout.amount.toLocaleString()} disbursed. Ref: ${reference}`);
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
      total_sales: 0, total_earned: 0, pending_balance: 0, available_balance: 0, total_paid: 0,
      total_clicks: 0, total_leads: 0
    } as Agent;
    await supabase.from('agents').insert([newAgent]);
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = async (agent: Agent) => {
    await supabase.from('agents').update(agent).eq('id', agent.id);
    setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
  };

  const addProperty = async (p: Property) => { await supabase.from('properties').insert([p]); setProperties(prev => [p, ...prev]); };
  const updateProperty = async (p: Property) => { await supabase.from('properties').update(p).eq('id', p.id); setProperties(prev => prev.map(old => old.id === p.id ? p : old)); };
  const deleteProperty = async (id: string) => { await supabase.from('properties').delete().eq('id', id); setProperties(prev => prev.filter(p => p.id !== id)); };
  const addLead = async (l: Lead) => { await supabase.from('leads').insert([l]); setLeads(prev => [l, ...prev]); };
  const updateLeadStatus = async (id: string, s: Lead['status']) => { await supabase.from('leads').update({ status: s }).eq('id', id); setLeads(prev => prev.map(l => l.id === id ? { ...l, status: s } : l)); };
  const addSubscriber = async (e: string) => { const s = { id: Date.now().toString(), email: e, date: new Date().toISOString() }; await supabase.from('subscribers').insert([s]); setSubscribers(prev => [s, ...prev]); };
  const updateSettings = async (s: SiteSettings) => { await supabase.from('site_settings').update(s).eq('id', 1); setSettings(s); };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts: [], agents, sales, payouts, auditLogs, settings, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty: (id) => properties.find(p => p.id === id),
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addAgent, updateAgent, addSale, updateSaleStatus, makeCommissionAvailable,
      requestPayout: async(p) => { await supabase.from('payout_requests').insert([p]); setPayouts(prev => [p, ...prev]); },
      processPayout,
      seedDatabase: async () => { await supabase.from('site_settings').upsert({ id: 1, ...DEFAULT_SETTINGS }); fetchData(); }
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => { const context = useContext(PropertyContext); if (!context) throw new Error('useProperties error'); return context; };

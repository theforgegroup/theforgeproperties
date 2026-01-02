
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber, BlogPost, PropertyType, ListingStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PropertyContextType {
  properties: Property[];
  leads: Lead[];
  subscribers: Subscriber[];
  posts: BlogPost[];
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
  seedDatabase: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'theforgeproperties@gmail.com',
  contact_phone: '+234 800 FORGE 00',
  address: 'Silverland Estate, Sangotedo, Ajah, Lagos, Nigeria',
  team_members: [
    { name: "Daniel Paul", role: "Co-Founder", image: "" },
    { name: "Paul Bolaji", role: "Co-Founder", image: "" },
    { name: "Samuel Oshin", role: "Co-Founder", image: "" }
  ],
  listing_agent: {
    name: "The Forge Properties",
    phone: "+234 800 FORGE 00",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200"
  }
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
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

  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      // Initialize system settings only, no mock listings
      const { data: existingSettings } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      
      if (!existingSettings) {
        await supabase.from('site_settings').upsert({ id: 1, ...DEFAULT_SETTINGS });
      }
      
      await fetchData();
      alert("System configuration initialized. You can now add your own listings and posts.");
    } catch (err) {
      console.error(err);
      alert("Initialization failed. Check Supabase connection.");
    } finally {
      setIsLoading(false);
    }
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
    const { error } = await supabase.from('site_settings').update(newSettings).eq('id', 1);
    if (error) throw error;
    setSettings(newSettings);
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts, settings, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty: (id) => properties.find(p => p.id === id), getPropertyBySlug: (slug) => properties.find(p => p.slug === slug),
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addPost, updatePost, deletePost, getPost: (id) => posts.find(p => p.id === id), getPostBySlug: (slug) => posts.find(p => p.slug === slug),
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

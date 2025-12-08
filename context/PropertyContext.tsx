import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber, BlogPost } from '../types';
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
  addLead: (lead: Lead) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  addSubscriber: (email: string) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  
  // Post Functions
  addPost: (post: BlogPost) => Promise<void>;
  updatePost: (post: BlogPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPost: (id: string) => BlogPost | undefined;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  contactEmail: 'theforgeproperties@gmail.com',
  contactPhone: '+234 800 FORGE 00',
  address: 'Silverland Estate, Sangotedo, Ajah, Lagos, Nigeria',
  teamMembers: [
    { 
      name: "Daniel Paul", 
      role: "Co-Founder", 
      image: "" 
    },
    { 
      name: "Paul Bolaji", 
      role: "Co-Founder", 
      image: "" 
    },
    { 
      name: "Samuel Oshin", 
      role: "Co-Founder", 
      image: "" 
    }
  ],
  listingAgent: {
    name: "The Forge Properties",
    phone: "+234 800 FORGE 00",
    image: ""
  }
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Initial Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propsRes, leadsRes, subsRes, postsRes, settingsRes] = await Promise.all([
          supabase.from('properties').select('*'),
          supabase.from('leads').select('*'),
          supabase.from('subscribers').select('*'),
          supabase.from('posts').select('*'),
          supabase.from('site_settings').select('*').single()
        ]);

        if (propsRes.data) setProperties(propsRes.data);
        if (leadsRes.data) setLeads(leadsRes.data);
        if (subsRes.data) setSubscribers(subsRes.data);
        if (postsRes.data) setPosts(postsRes.data);
        
        if (settingsRes.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
        } else {
            setSettings(DEFAULT_SETTINGS); 
        }

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- CRUD Operations ---

  // Properties
  const addProperty = async (property: Property) => {
    const { error } = await supabase.from('properties').insert([property]);
    if (error) throw error;
    setProperties(prev => [property, ...prev]);
  };

  const updateProperty = async (updatedProperty: Property) => {
    const { error } = await supabase
      .from('properties')
      .update(updatedProperty)
      .eq('id', updatedProperty.id);
      
    if (error) throw error;
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const getProperty = (id: string) => {
    return properties.find(p => p.id === id);
  };

  // Blog Posts
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

  const getPost = (id: string) => {
    return posts.find(p => p.id === id);
  };

  // Leads
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

  // Subscribers
  const addSubscriber = async (email: string) => {
    if (subscribers.some(s => s.email === email)) return;

    const newSubscriber: Subscriber = {
      id: Date.now().toString(),
      email,
      date: new Date().toISOString()
    };
    
    const { error } = await supabase.from('subscribers').insert([newSubscriber]);
    if (error) throw error;
    setSubscribers(prev => [newSubscriber, ...prev]);
  };

  // Settings
  const updateSettings = async (newSettings: SiteSettings) => {
    const { error } = await supabase
      .from('site_settings')
      .update(newSettings)
      .eq('id', 1);

    if (error) throw error;
    setSettings(newSettings);
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, posts, settings, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty,
      addLead, updateLeadStatus, addSubscriber, updateSettings,
      addPost, updatePost, deletePost, getPost
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
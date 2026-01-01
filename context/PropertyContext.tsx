
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
    image: ""
  }
};

const SAMPLE_POST: BlogPost = {
  id: 'sample-1',
  slug: 'the-future-of-luxury-real-estate-in-lagos',
  title: 'The Future of Luxury Real Estate in Lagos',
  excerpt: 'An in-depth look at how the Lekki-Epe corridor is transforming into the new gold standard for high-net-worth investments.',
  content: '<p>As the skyline of Lagos continues to evolve, a new definition of luxury is emerging...</p>',
  cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop',
  author: 'The Forge Properties',
  date: new Date().toISOString(),
  category: 'Market Insights',
  status: 'Published',
  meta_description: 'Discover the emerging trends in Lagos luxury real estate market.',
  keyphrase: 'Lagos Luxury Real Estate'
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const propsRes = await supabase.from('properties').select('*');
        if (propsRes.error) console.error("Properties Fetch Error:", propsRes.error);
        else setProperties(propsRes.data || []);

        const leadsRes = await supabase.from('leads').select('*');
        if (leadsRes.error) console.error("Leads Fetch Error:", leadsRes.error);
        else setLeads(leadsRes.data || []);

        const subsRes = await supabase.from('subscribers').select('*');
        if (subsRes.error) console.error("Subscribers Fetch Error:", subsRes.error);
        else setSubscribers(subsRes.data || []);

        const postsRes = await supabase.from('posts').select('*');
        if (postsRes.error) {
           console.warn("Using sample post due to schema mismatch:", postsRes.error.message);
           setPosts([SAMPLE_POST]);
        } else {
           setPosts(postsRes.data && postsRes.data.length > 0 ? postsRes.data : [SAMPLE_POST]);
        }

        const settingsRes = await supabase.from('site_settings').select('*').single();
        if (settingsRes.error) {
           console.warn("Settings Load Error, using defaults:", settingsRes.error.message);
           setSettings(DEFAULT_SETTINGS);
        } else if (settingsRes.data) {
           // Merging to ensure we don't have partial objects if DB row is incomplete
           setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
        }

      } catch (error) {
        console.error('Critical Error in Data Fetch:', error);
        setPosts([SAMPLE_POST]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
    if (updatedPost.id === 'sample-1') {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        return;
    }
    const { error } = await supabase.from('posts').update(updatedPost).eq('id', updatedPost.id);
    if (error) throw error;
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = async (id: string) => {
    if (id === 'sample-1') {
        setPosts(prev => prev.filter(p => p.id !== id));
        return;
    }
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
      addPost, updatePost, deletePost, getPost: (id) => posts.find(p => p.id === id), getPostBySlug: (slug) => posts.find(p => p.slug === slug)
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

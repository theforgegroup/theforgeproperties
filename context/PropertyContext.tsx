import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PropertyContextType {
  properties: Property[];
  leads: Lead[];
  subscribers: Subscriber[];
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
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// MailerLite Configuration
const MAILERLITE_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMGZmMmJmODZiM2FkY2NiM2UyNzc0ODBiZmYxMGRiNWQxMDQ3NWFhODAzZWVkMWYwNDg5NjkzN2YwYTJlMTc4NjI1YTk4ZmJhZTMyMzU5YTkiLCJpYXQiOjE3NjUyMzAyMTAuMzM3NjY3LCJuYmYiOjE3NjUyMzAyMTAuMzM3NjY5LCJleHAiOjQ5MjA5MDM4MTAuMzMzNjMyLCJzdWIiOiIxOTg4MjIyIiwic2NvcGVzIjpbXX0.DdRJpwHf2kCfAUUza8Os_rgWJ9SdfXSk3oajGljbKkHwX-3IV1z4udpbj9YJtI2a4KpHoG9NZCHXHENRpaP7NVbNdHT9m4yjSiVlLjuXWQjry4lUBgu5WaIsXeoipJ9HSX0x4bBDeUtPCLJSOss-MjTPJ-AuvoQ1Ntow4Udb8JUbxosZ2Fs3FppjjtTFhSQZ0P9qZk6LVuJFq2RHKtCTUdL2dWQBoPVKjsPvOaAefJ-kBSCwryiP2Wr6U5lnzROx2LrTAPqVRAWkQHt-5DZTsc9vwSaWCnZ1Twg87NXsVUSSRb3hvG2cnmfOuJYqI82TGoP6OuIN_6e0jzl03odlxkiiygUPgzMHAdHmrTE1RP9c_53QgxPza_iVVC4HvFDj_YZErWKPYVFUjjRjFzUAwpJzdSaDMNkkOh5bryWm5dx9qGcFxb-2UT4WVccL0W-hOFHbZEXoMoHmzKNMeqnEiJFWhk8HcJE0iGwcKU3RQbYkJBHcS_lWcOFqbflc6wiHjiisWXRwnJK_Jmi7JKlIkTOTYtM4dDM7bht3WOMHSCQTCwa4ntaF4KfR9oET5PMxTmcNbXZF22u8zN8TMZCf4ItUjAwQv2d9Om1rR-G4jrPTYzQG39zneATO3-Uqhq8oAks1q8IzvIWyXmmx4nk__aqzRWJLTEYHhxezhSbFaPA";

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
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Initial Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propsRes, leadsRes, subsRes, settingsRes] = await Promise.all([
          supabase.from('properties').select('*'),
          supabase.from('leads').select('*'),
          supabase.from('subscribers').select('*'),
          supabase.from('site_settings').select('*').single()
        ]);

        if (propsRes.data) setProperties(propsRes.data);
        if (leadsRes.data) setLeads(leadsRes.data);
        if (subsRes.data) setSubscribers(subsRes.data);
        
        if (settingsRes.data) {
          // Merge with default to ensure new fields (like listingAgent) exist if not in DB yet
          setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
        } else {
            // Use defaults if table is empty
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

  // CRUD Operations - Supabase

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

    const newSubscriber: Subscriber = {
      id: Date.now().toString(),
      email,
      date: new Date().toISOString()
    };
    
    // 1. Add to Supabase
    const { error } = await supabase.from('subscribers').insert([newSubscriber]);
    if (error) throw error;
    setSubscribers(prev => [newSubscriber, ...prev]);

    // 2. Sync with MailerLite
    try {
      await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
        })
      });
    } catch (err) {
      // We log the error but do not throw it, so the user still sees a "Success" message
      // as the data was successfully saved to Supabase.
      console.warn("MailerLite sync issue:", err);
    }
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    // We assume ID 1 for single row settings
    const { error } = await supabase
      .from('site_settings')
      .update(newSettings)
      .eq('id', 1);

    if (error) throw error;
    setSettings(newSettings);
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, settings, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty,
      addLead, updateLeadStatus, addSubscriber, updateSettings
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
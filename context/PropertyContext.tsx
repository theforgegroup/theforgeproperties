import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, Lead, SiteSettings, Subscriber } from '../types';
import { MOCK_LEADS } from '../services/mockData';

interface PropertyContextType {
  properties: Property[];
  leads: Lead[];
  subscribers: Subscriber[];
  settings: SiteSettings;
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
  addLead: (lead: Lead) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  addSubscriber: (email: string) => void;
  updateSettings: (settings: SiteSettings) => void;
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
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" 
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
  ]
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with empty arrays to ensure we rely on Storage or User Input
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedProps = localStorage.getItem('theforge_properties');
    const storedLeads = localStorage.getItem('theforge_leads');
    const storedSubs = localStorage.getItem('theforge_subscribers');
    const storedSettings = localStorage.getItem('theforge_settings');

    if (storedProps) {
      setProperties(JSON.parse(storedProps));
    } else {
      localStorage.setItem('theforge_properties', JSON.stringify([]));
      setProperties([]);
    }

    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      localStorage.setItem('theforge_leads', JSON.stringify(MOCK_LEADS));
      setLeads(MOCK_LEADS);
    }
    
    if (storedSubs) {
      setSubscribers(JSON.parse(storedSubs));
    } else {
      localStorage.setItem('theforge_subscribers', JSON.stringify([]));
    }

    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      if (!parsedSettings.teamMembers) {
        const mergedSettings = { ...parsedSettings, teamMembers: DEFAULT_SETTINGS.teamMembers };
        setSettings(mergedSettings);
        localStorage.setItem('theforge_settings', JSON.stringify(mergedSettings));
      } else {
        setSettings(parsedSettings);
      }
    } else {
      localStorage.setItem('theforge_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    
    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theforge_properties' && e.newValue) setProperties(JSON.parse(e.newValue));
      if (e.key === 'theforge_leads' && e.newValue) setLeads(JSON.parse(e.newValue));
      if (e.key === 'theforge_subscribers' && e.newValue) setSubscribers(JSON.parse(e.newValue));
      if (e.key === 'theforge_settings' && e.newValue) setSettings(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // CRUD Operations - DIRECT TO STORAGE (Read-Modify-Write Pattern)
  
  const addProperty = (property: Property) => {
    const stored = localStorage.getItem('theforge_properties');
    const currentList = stored ? JSON.parse(stored) : properties;
    const newProperties = [property, ...currentList];
    
    localStorage.setItem('theforge_properties', JSON.stringify(newProperties));
    setProperties(newProperties);
    window.dispatchEvent(new Event('local-storage'));
  };

  const updateProperty = (updatedProperty: Property) => {
    const stored = localStorage.getItem('theforge_properties');
    const currentList = stored ? JSON.parse(stored) : properties;
    
    const newProperties = currentList.map((p: Property) => 
      p.id === updatedProperty.id ? updatedProperty : p
    );
    
    localStorage.setItem('theforge_properties', JSON.stringify(newProperties));
    setProperties(newProperties);
    window.dispatchEvent(new Event('local-storage'));
  };

  const deleteProperty = (id: string) => {
    const stored = localStorage.getItem('theforge_properties');
    const currentList = stored ? JSON.parse(stored) : properties;
    
    const newProperties = currentList.filter((p: Property) => p.id !== id);
    
    localStorage.setItem('theforge_properties', JSON.stringify(newProperties));
    setProperties(newProperties);
    window.dispatchEvent(new Event('local-storage'));
  };

  const getProperty = (id: string) => {
    return properties.find(p => p.id === id);
  };

  const addLead = (lead: Lead) => {
    const stored = localStorage.getItem('theforge_leads');
    const currentList = stored ? JSON.parse(stored) : leads;
    const newLeads = [lead, ...currentList];
    
    localStorage.setItem('theforge_leads', JSON.stringify(newLeads));
    setLeads(newLeads);
    window.dispatchEvent(new Event('local-storage'));
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    const stored = localStorage.getItem('theforge_leads');
    const currentList = stored ? JSON.parse(stored) : leads;
    
    const newLeads = currentList.map((l: Lead) => l.id === id ? { ...l, status } : l);
    
    localStorage.setItem('theforge_leads', JSON.stringify(newLeads));
    setLeads(newLeads);
    window.dispatchEvent(new Event('local-storage'));
  };

  const addSubscriber = (email: string) => {
    const stored = localStorage.getItem('theforge_subscribers');
    const currentList = stored ? JSON.parse(stored) : subscribers;
    
    // Prevent duplicates
    if (currentList.some((s: Subscriber) => s.email === email)) return;

    const newSubscriber: Subscriber = {
      id: Date.now().toString(),
      email,
      date: new Date().toISOString()
    };
    
    const newList = [newSubscriber, ...currentList];
    localStorage.setItem('theforge_subscribers', JSON.stringify(newList));
    setSubscribers(newList);
    window.dispatchEvent(new Event('local-storage'));
  };

  const updateSettings = (newSettings: SiteSettings) => {
    localStorage.setItem('theforge_settings', JSON.stringify(newSettings));
    setSettings(newSettings);
    window.dispatchEvent(new Event('local-storage'));
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, leads, subscribers, settings,
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
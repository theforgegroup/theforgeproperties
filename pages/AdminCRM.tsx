
import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, Calendar, Check, ChevronDown, Copy } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';

type CRMView = 'leads' | 'subscribers';

export const AdminCRM: React.FC = () => {
  const { leads, subscribers, updateLeadStatus } = useProperties();
  const [view, setView] = useState<CRMView>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All Statuses');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredLeads = leads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.property_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Statuses' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-amber-100 text-amber-700';
      case 'Qualified': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-slate-800 text-white';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <AdminLayout>
      <div className="w-full">
        <h1 className="text-4xl font-serif text-forge-navy mb-8">CRM Dashboard</h1>

        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button onClick={() => setView('leads')} className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest ${view === 'leads' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}>Leads ({leads.length})</button>
          <button onClick={() => setView('subscribers')} className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest ${view === 'subscribers' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}>Newsletter ({subscribers.length})</button>
        </div>

        {view === 'leads' ? (
          <div className="space-y-6">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-forge-navy mb-2">{lead.name}</h3>
                    <div className="flex gap-6 text-slate-500 text-sm">
                      <span className="flex items-center gap-2"><Mail size={16} /> {lead.email}</span>
                      <span className="flex items-center gap-2"><Phone size={16} /> {lead.phone}</span>
                    </div>
                  </div>
                  <div className={`px-5 py-2.5 rounded text-sm font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>{lead.status}</div>
                </div>
                <div className="bg-slate-50 rounded p-6 my-6 italic text-slate-700 font-serif">"{lead.message}"</div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{new Date(lead.date).toLocaleString()}</span>
                  {lead.property_title && <span className="text-forge-gold">Ref: {lead.property_title}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

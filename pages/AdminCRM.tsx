
import React, { useState } from 'react';
import { Search, Filter, Mail, Phone, Calendar, Check, ChevronDown, Copy, Inbox } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { Lead } from '../types';

type CRMView = 'leads' | 'subscribers';

export const AdminCRM: React.FC = () => {
  const { leads, subscribers, updateLeadStatus } = useProperties();
  const [view, setView] = useState<CRMView>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All Statuses');

  // Explicitly remove "Chief Adewale" if it exists as mock data artifact
  const filteredLeads = [...leads]
    .filter(l => l.name !== 'Chief Adewale')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
        <h1 className="text-3xl md:text-4xl font-serif text-forge-navy mb-6 md:mb-8">CRM Dashboard</h1>

        <div className="flex gap-4 mb-6 md:mb-8 border-b border-slate-200">
          <button onClick={() => setView('leads')} className={`pb-4 px-2 text-[10px] md:text-sm font-bold uppercase tracking-widest ${view === 'leads' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}>Leads ({leads.length})</button>
          <button onClick={() => setView('subscribers')} className={`pb-4 px-2 text-[10px] md:text-sm font-bold uppercase tracking-widest ${view === 'subscribers' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}>Newsletter ({subscribers.length})</button>
        </div>

        {view === 'leads' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-forge-gold"
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none"
              >
                <option>All Statuses</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Qualified</option>
                <option>Closed</option>
              </select>
            </div>

            {filteredLeads.length > 0 ? filteredLeads.map(lead => (
              <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 relative hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-forge-navy mb-2">{lead.name}</h3>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 text-slate-500 text-xs md:text-sm">
                      <span className="flex items-center gap-2"><Mail size={16} className="shrink-0" /> {lead.email}</span>
                      <span className="flex items-center gap-2"><Phone size={16} className="shrink-0" /> {lead.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className={`w-full md:w-auto px-5 py-2.5 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider cursor-pointer focus:outline-none transition-colors ${getStatusColor(lead.status)}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-50 rounded p-4 md:p-6 my-4 md:my-6 italic text-slate-700 font-serif border-l-4 border-forge-gold text-sm md:text-base">
                  "{lead.message}"
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-[10px] text-slate-400 gap-2 uppercase tracking-widest font-bold">
                  <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(lead.date).toLocaleString()}</span>
                  {lead.property_title && (
                    <span className="text-forge-gold">
                      Ref: {lead.property_title}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-200">
                <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-serif text-xl">No leads found.</p>
                <p className="text-slate-500 text-sm">Once clients contact you, their information will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 overflow-x-auto shadow-sm">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="p-6">Email Address</th>
                  <th className="p-6">Subscription Date</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {subscribers.map(sub => (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-6 font-medium text-forge-navy">{sub.email}</td>
                    <td className="p-6 text-slate-500">{new Date(sub.date).toLocaleDateString()}</td>
                    <td className="p-6 text-right">
                      <button className="text-forge-gold hover:text-forge-navy font-bold uppercase text-[10px] tracking-widest transition-colors">Remove</button>
                    </td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-400 italic">No newsletter subscribers yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

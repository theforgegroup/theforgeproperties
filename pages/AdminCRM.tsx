import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Mail, Phone, Calendar, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';

export const AdminCRM: React.FC = () => {
  const { leads, updateLeadStatus } = useProperties();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All Statuses');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.status-dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const filteredLeads = leads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Statuses' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-amber-100 text-amber-700';
      case 'Qualified': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-slate-800 text-white';
      case 'Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Helper to extract money amount from message if it exists
  const extractOfferAmount = (message: string) => {
    const match = message.match(/(\d+(?:\.\d+)?\s?(?:Billion|Million|k)|₦?[\d,]+)/i);
    return match ? match[0] : null;
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-4xl font-serif text-forge-navy mb-2">CRM Dashboard</h1>
           <p className="text-slate-500 text-base">Manage inquiries, viewings, and offers.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-lg text-base focus:outline-none focus:border-forge-gold shadow-sm transition-all placeholder-slate-400"
            />
          </div>
          
          <div className="relative min-w-[240px]">
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <Filter size={20} />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-14 pr-10 py-5 bg-white border border-slate-200 rounded-lg text-base appearance-none focus:outline-none focus:border-forge-gold shadow-sm cursor-pointer font-medium text-slate-600"
            >
              <option>All Statuses</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Closed</option>
              <option>Lost</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Leads Cards */}
        <div className="space-y-6">
          {filteredLeads.length > 0 ? filteredLeads.map(lead => {
             const offerAmount = lead.type === 'Offer' ? extractOfferAmount(lead.message) : null;
             
             return (
              <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-lg transition-shadow relative overflow-visible">
                {lead.status === 'New' && (
                  <span className="absolute top-6 right-6 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    New
                  </span>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-serif text-2xl font-bold text-forge-navy">{lead.name}</h3>
                      {lead.type === 'Offer' ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">Offer</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">{lead.type}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-6 text-base text-slate-500">
                      <span className="flex items-center gap-2 hover:text-forge-gold transition-colors"><Mail size={16} /> {lead.email}</span>
                      <span className="flex items-center gap-2 hover:text-forge-gold transition-colors"><Phone size={16} /> {lead.phone}</span>
                    </div>
                  </div>

                  {/* Custom Status Dropdown */}
                  <div className="relative status-dropdown mt-2 md:mt-0">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === lead.id ? null : lead.id)}
                      className={`flex items-center gap-3 px-5 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-colors shadow-sm ${getStatusColor(lead.status)}`}
                    >
                      {lead.status}
                      <ChevronDown size={16} />
                    </button>

                    {activeDropdown === lead.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 z-20 py-2 overflow-hidden">
                        {['New', 'Contacted', 'Qualified', 'Closed', 'Lost'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              updateLeadStatus(lead.id, status as any);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white uppercase tracking-wider flex items-center justify-between transition-colors"
                          >
                            {status}
                            {lead.status === status && <Check size={16} className="text-forge-gold" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-100">
                  <p className="text-slate-700 italic text-lg font-serif leading-relaxed">"{lead.message}"</p>
                  
                  {/* Highlight Offer Amount */}
                  {lead.type === 'Offer' && (
                    <div className="mt-4 flex items-center gap-3 text-green-600 font-bold border-t border-slate-200/50 pt-4">
                       <span className="text-sm uppercase tracking-widest text-green-600/70">Offer Value:</span>
                       <span className="text-2xl">₦{offerAmount || '---'}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(lead.date).toLocaleString()}
                  </div>
                  {lead.propertyTitle && (
                    <div className="text-forge-gold flex items-center gap-2">
                      <span className="text-slate-400">Interest:</span>
                      <span className="font-medium">{lead.propertyTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-32 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-serif text-xl">No active leads found.</p>
              <p className="text-slate-400 mt-2">New inquiries will appear here instantly.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
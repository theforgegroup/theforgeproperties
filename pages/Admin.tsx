import React, { useState } from 'react';
import { Trash2, Edit, Plus, Search, MapPin, Info } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';

export const Admin: React.FC = () => {
  const { properties, leads, deleteProperty } = useProperties();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this listing?')) {
        deleteProperty(id);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get top 3 recent leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-500';
      case 'Contacted': return 'bg-amber-50 text-amber-600 border-amber-500';
      case 'Qualified': return 'bg-green-50 text-green-600 border-green-500';
      case 'Closed': return 'bg-slate-800 text-white border-slate-700';
      case 'Lost': return 'bg-red-50 text-red-600 border-red-500';
      default: return 'bg-slate-50 text-slate-600 border-slate-400';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'New': return 'border-blue-500';
      case 'Contacted': return 'border-amber-500';
      case 'Qualified': return 'border-green-500';
      case 'Closed': return 'border-slate-800';
      case 'Lost': return 'border-red-500';
      default: return 'border-forge-gold';
    }
  };

  return (
    <AdminLayout>
      {/* Recent Inquiries Section */}
      <div className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-serif text-forge-navy">Recent Inquiries</h2>
          <button 
            onClick={() => navigate('/admin/crm')}
            className="text-xs font-bold text-forge-gold uppercase tracking-widest hover:text-forge-navy transition-colors flex items-center gap-1"
          >
            View All Leads <span className="text-lg leading-none">□</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentLeads.length > 0 ? recentLeads.map(lead => (
            <div key={lead.id} className={`bg-white p-6 rounded shadow-sm border-l-4 ${getBorderColor(lead.status)}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {lead.status}
                </span>
                <span className="text-slate-400 text-xs">{new Date(lead.date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-serif font-bold text-forge-navy mb-1">{lead.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">"{lead.message}"</p>
              {lead.propertyTitle && (
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                  Re: {lead.propertyTitle}
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-3 bg-white p-8 rounded border border-dashed border-slate-300 text-center text-slate-400">
              No recent inquiries found.
            </div>
          )}
        </div>
      </div>

      {/* Listing Management Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-forge-navy mb-2">Listing Management</h1>
          <p className="text-slate-500 text-sm">Manage your property portfolio</p>
        </div>
        <button 
          onClick={() => navigate('/admin/properties/new')}
          className="bg-forge-gold text-forge-navy px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white border border-transparent hover:border-forge-gold transition-all shadow-md"
        >
          <Plus size={16} /> Add New Listing
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title or location..." 
          className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-lg pl-12 pr-4 py-4 focus:outline-none focus:border-forge-gold focus:ring-1 focus:ring-forge-gold transition-all shadow-sm placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto border border-slate-200">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-200">
            <tr>
              <th className="p-5">Property</th>
              <th className="p-5">Type</th>
              <th className="p-5">Price</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProperties.length > 0 ? filteredProperties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img src={p.images[0]} alt="" className="w-12 h-12 rounded object-cover shadow-sm" />
                    <div>
                      <div className="font-bold text-forge-navy">{p.title}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {p.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                    {p.type}
                  </span>
                </td>
                <td className="p-5 font-medium text-slate-700">
                  ₦{p.price.toLocaleString()}
                </td>
                <td className="p-5">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                    p.status === 'For Sale' ? 'bg-green-50 text-green-600' : 
                    p.status === 'Sold' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex gap-3 justify-end text-slate-400">
                    <button 
                      onClick={() => navigate(`/admin/properties/edit/${p.id}`)}
                      className="hover:text-forge-gold transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No properties found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-center text-xs text-slate-400">
        Showing {filteredProperties.length} results
      </div>
    </AdminLayout>
  );
};